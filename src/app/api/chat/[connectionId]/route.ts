import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server/resolve-user'
import { agentGraph } from '@/agents/graph'
import { AgentStateType, ConversationMessage } from '@/agents/state'
import { Prisma } from '@/generated/prisma/client'

// ─── SSE Helper ───────────────────────────────────────────────────────────────
function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  // ── Step 1: Authenticate ───────────────────────────────────────────────────
  const user = await getCurrentUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // ── Step 2: Await params ─────────────────────────
  const { connectionId } = await params

  // ── Step 3: Parse body ─────────────────────────────────────────────────────
  let body: { query?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const nlQuery = body.query?.trim()

  if (!nlQuery) {
    return new Response('Missing query', { status: 400 })
  }

  // ── Step 4: Verify connection ownership & sync status ─────────────────────
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
    return new Response('Connection not found or access denied', { status: 404 })
  }

  if (connection.syncStatus !== 'SYNCED') {
    return new Response(
      'Schema not synced yet. Please wait for sync to complete.',
      { status: 400 }
    )
  }

  // ── Step 5: Load conversation history ─────────────────────────────────────
  const conversation = await prisma.conversation.findUnique({
      where: {
      connectionId_userId: { connectionId, userId: user.id },
    },
    select: { messages: true },
  })

  const conversationHistory = (
      conversation?.messages ?? []
  ) as unknown as AgentStateType['conversationHistory']

  // ── Step 6: Build SSE stream ───────────────────────────────────────────────
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

        // Track final response and sql for conversation persistence
        let finalResponse = ''
        let finalSql:      string | undefined = undefined

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
                send('status', {
                  message: `Query returned ${nodeOutput.queryResult.rowCount} rows`,
                })
              }
              break
            case 'detectVisualization':
              if (nodeOutput.chartConfig) {
                send('chart', { chartConfig: nodeOutput.chartConfig })
              }
              break

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
        }

        const newMessages: ConversationMessage[] = [
          ...conversationHistory,
          userMessage,
          assistantMessage,
        ]

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

  // ── Step 7: Return SSE response ────────────────────────────────────────────
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type':                'text/event-stream; charset=utf-8',
      'Cache-Control':               'no-cache, no-transform',
      'Connection':                  'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering':           'no',
    },
  })
}
