import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import { withErrorHandler } from '@/lib/api-handler'
import { ApiError, Errors } from '@/lib/api-error'
import { checkRateLimit } from '@/lib/rate-limit'
import { agentGraph } from '@/agents/graph'
import { AgentStateType, ConversationMessage } from '@/agents/state'
import { Prisma } from '@/generated/prisma/client'

const MAX_QUERY_LENGTH = 2000
const PERSISTED_ROW_CAP = 500
// Keep heavy turn metadata (result rows, chart, reasoning) only on the most
// recent assistant turns. Older turns collapse to text + SQL so the stored
// conversation JSON does not grow without bound as it is re-read and re-written
// every turn. The agent prompt only consumes content + sql from history, so
// slimming older turns has no effect on answer quality.
const RICH_HISTORY_TURNS = 3

// ─── SSE Helper ───────────────────────────────────────────────────────────────
function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

// Drop heavy fields from an older assistant turn, keeping only the lightweight
// identity fields needed for display and prompt context.
function slimAssistantTurn(message: ConversationMessage): ConversationMessage {
  const slim: ConversationMessage = {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
  }
  if (message.sql) slim.sql = message.sql
  if (typeof message.sqlAttempt === 'number') slim.sqlAttempt = message.sqlAttempt
  if (typeof message.rowCount === 'number') slim.rowCount = message.rowCount
  return slim
}

// Keep the most recent RICH_HISTORY_TURNS assistant turns rich; slim the rest.
function slimHistoryForStorage(messages: ConversationMessage[]): ConversationMessage[] {
  let assistantSeen = 0
  return messages
    .slice()
    .reverse()
    .map(message => {
      if (message.role !== 'assistant') return message
      assistantSeen += 1
      return assistantSeen <= RICH_HISTORY_TURNS ? message : slimAssistantTurn(message)
    })
    .reverse()
}

// ─── Route Handler ────────────────────────────────────────────────────────────
// Pre-stream failures (auth, validation, ownership, rate limit) follow the
// standard { error: { code, message } } contract via withErrorHandler + ApiError.
// Once the agent starts, output is streamed over SSE and in-stream failures are
// genericized as an `error` event so internals never leak to the client.
export const POST = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) => {
  // ── Step 1: Authenticate ───────────────────────────────────────────────────
  const user = await requireCurrentUser()

  // ── Step 2: Rate limit (per user, sliding window) ──────────────────────────
  const rate = await checkRateLimit(`chat:${user.id}`)
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: {
          code: Errors.RATE_LIMITED.code,
          message: Errors.RATE_LIMITED.message,
        },
      },
      {
        status: Errors.RATE_LIMITED.statusCode,
        headers: { 'Retry-After': String(rate.retryAfterSeconds) },
      }
    )
  }

  // ── Step 3: Await params ────────────────────────────────────────────────────
  const { connectionId } = await params

  // ── Step 4: Parse and validate body ────────────────────────────────────────
  let body: { query?: string }
  try {
    body = await req.json()
  } catch {
    throw new ApiError('INVALID_BODY', 'Request body must be valid JSON', 400)
  }

  const nlQuery = body.query?.trim()

  if (!nlQuery) {
    throw new ApiError('INVALID_QUERY', 'A query is required', 400)
  }

  if (nlQuery.length > MAX_QUERY_LENGTH) {
    throw new ApiError(
      'QUERY_TOO_LONG',
      `Query must be ${MAX_QUERY_LENGTH} characters or fewer`,
      400
    )
  }

  // ── Step 5: Verify connection ownership & sync status ──────────────────────
  const connection = await prisma.connection.findFirst({
    where: {
      id:         connectionId,
      userId:     user.id,
      isArchived: false,
    },
    select: {
      id:         true,
      syncStatus: true,
    },
  })

  if (!connection) {
    throw Errors.CONNECTION_NOT_FOUND
  }

  if (connection.syncStatus !== 'SYNCED') {
    throw new ApiError(
      'SCHEMA_NOT_READY',
      'Schema sync must complete before running queries',
      409
    )
  }

  // ── Step 6: Load conversation history ──────────────────────────────────────
  const conversation = await prisma.conversation.findUnique({
    where: {
      connectionId_userId: { connectionId, userId: user.id },
    },
    select: { messages: true },
  })

  const conversationHistory = (
    conversation?.messages ?? []
  ) as unknown as AgentStateType['conversationHistory']

  // ── Step 7: Build SSE stream ────────────────────────────────────────────────
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {

      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(sseEvent(event, data)))
      }

      try {
        send('status', { message: 'Classifying intent...' })

        // ── Build initial agent state ────────────────────────────────────────
        const initialState: Partial<AgentStateType> = {
          nlQuery,
          connectionId,
          userId: user.id,
          conversationHistory,
          startedAt:            Date.now(),
          sqlAttempts:          [],
          relevantTables:       [],
          retryCount:           0,
          isBlocked:            false,
          blockedReason:        '',
          lastError:            '',
          queryResult:          null,
          chartConfig:          null,
          finalResponse:        '',
        }

        // ── Run the agent ────────────────────────────────────────────────────
        const agentStream = await agentGraph.stream(initialState, {
          streamMode: 'updates',
        })

        // Track final response and rich turn metadata for conversation persistence
        let finalResponse = ''
        let finalSql:      string | undefined = undefined
        let finalSqlAttempt: number | undefined = undefined
        let finalChartConfig: AgentStateType['chartConfig'] = null
        let finalQueryResult: AgentStateType['queryResult'] = null
        const reasoningSteps: string[] = []

        // ── Stream node updates to client ────────────────────────────────────
        for await (const update of agentStream) {
          const updateRecord = update as Record<string, Partial<AgentStateType>>
          const nodeName   = Object.keys(updateRecord)[0]
          const nodeOutput = updateRecord[nodeName]

          switch (nodeName) {
            case 'classifyIntent':
              send('status', {
                message: `Intent: ${nodeOutput.intent ?? 'analyzing'}...`,
              })
              break

            case 'schemaContext':
              send('status', {
                message: `Schema loaded — ${nodeOutput.relevantTables?.length ?? 0} tables`,
              })
              break

            case 'generateSQL':
              if (nodeOutput.currentSql) {
                finalSql = nodeOutput.currentSql
                finalSqlAttempt = nodeOutput.sqlAttempts?.length ?? 1
                send('sql', {
                  sql:     nodeOutput.currentSql,
                  attempt: nodeOutput.sqlAttempts?.length ?? 1,
                })
                send('status', { message: 'Executing query...' })
              }
              break

            case 'validateSQL':
              if (nodeOutput.isBlocked) {
                send('status', { message: 'Query blocked for safety' })
              }
              break

            case 'selfHeal':
              reasoningSteps.push(`Self-healing — attempt ${nodeOutput.retryCount ?? 1}`)
              send('reasoning', {
                message:    `Self-healing — attempt ${nodeOutput.retryCount ?? 1}`,
                retryCount: nodeOutput.retryCount,
              })
              send('status', {
                message: `Correcting SQL — attempt ${nodeOutput.retryCount}...`,
              })
              break

            case 'executeSQL':
              if (nodeOutput.queryResult) {
                finalQueryResult = nodeOutput.queryResult
                send('results', { queryResult: nodeOutput.queryResult })
                send('status', {
                  message: `Query returned ${nodeOutput.queryResult.rowCount} rows`,
                })
              }
              break
            case 'detectVisualization':
              if (nodeOutput.chartConfig) {
                finalChartConfig = nodeOutput.chartConfig
                send('chart', { chartConfig: nodeOutput.chartConfig })
              }
              break

            case 'generateGeneralResponse':
            case 'generateSchemaResponse':
            case 'generateResponse':
              if (nodeOutput.finalResponse) {
                finalResponse = nodeOutput.finalResponse
                send('response', { text: nodeOutput.finalResponse })
              }
              break

            case 'auditLog':
              break

            default:
              break
          }
        }

        // ── Persist conversation history ──────────────────────────────────
        const userMessage: ConversationMessage = {
          role:      'user',
          content:   nlQuery,
          timestamp: new Date().toISOString(),
        }

        const assistantMessage: ConversationMessage = {
          role:      'assistant',
          content:   finalResponse,
          timestamp: new Date().toISOString(),
          ...(finalSql ? { sql: finalSql } : {}), // only include sql if it exists
          ...(finalSqlAttempt ? { sqlAttempt: finalSqlAttempt } : {}),
          ...(reasoningSteps.length > 0 ? { reasoning: reasoningSteps } : {}),
          ...(finalChartConfig ? { chartConfig: finalChartConfig } : {}),
          // Cap persisted rows so the stored conversation JSON stays bounded —
          // the table only needs enough rows to be useful on reload, not the
          // full (up to 10k) result set. Recompute the dependent metadata so
          // the stored result stays internally consistent: if we clip rows, the
          // reloaded table/chart must report it as truncated rather than
          // claiming the full count while showing fewer rows.
          ...(finalQueryResult
            ? {
                queryResult: (() => {
                  const cappedRows = finalQueryResult.rows.slice(0, PERSISTED_ROW_CAP)
                  const clipped = finalQueryResult.rows.length > PERSISTED_ROW_CAP
                  return {
                    ...finalQueryResult,
                    rows: cappedRows,
                    returnedRowCount: cappedRows.length,
                    isTruncated: finalQueryResult.isTruncated || clipped,
                  }
                })(),
              }
            : {}),
        }

        const newMessages: ConversationMessage[] = slimHistoryForStorage([
          ...conversationHistory,
          userMessage,
          assistantMessage,
        ])

        // Persist conversation history. The answer has ALREADY been streamed
        // to the client at this point, so a persistence failure must NOT be
        // reported as an agent error — log it and still send `done` so the
        // delivered answer is treated as complete. (The only cost is that this
        // turn won't appear in history on reload.)
        try {
          await prisma.conversation.upsert({
            where: {
              connectionId_userId: { connectionId, userId: user.id },
            },
            update: {
              messages:  newMessages as unknown as Prisma.InputJsonValue,
              updatedAt: new Date(),
            },
            create: {
              connectionId,
              userId: user.id,
              messages: newMessages as unknown as Prisma.InputJsonValue,
            },
          })
        } catch (persistError) {
          console.error('[chat/stream] Failed to persist conversation:', persistError)
        }

        send('done', { message: 'Complete' })

      } catch (error) {
        console.error('[chat/stream] Agent error:', error)
        send('error', {
          message: 'Something went wrong. Please try again.',
        })
      } finally {
        controller.close()
      }
    },
  })

  // ── Step 8: Return SSE response ─────────────────────────────────────────────
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type':      'text/event-stream; charset=utf-8',
      'Cache-Control':     'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
})
