import { generateCompletion } from '@/lib/llm'
import { AgentStateType, QueryResult } from '../state'

// ─── System Prompt ────────────────────────────────────────────────────────────
const RESPONSE_SYSTEM_PROMPT = `You are a data analyst assistant for a product called Datavue.

You will be given:
1. The original question the user asked
2. The SQL query that was executed
3. The query results as JSON

Your job is to write a clear, concise natural language answer to the user's question based on the data returned.

RULES:
1. Answer the question directly — lead with the answer, not with preamble
2. Reference specific numbers and values from the results
3. Keep the response concise — 1 to 3 sentences for simple queries, short paragraph for complex ones
4. Do not explain the SQL or mention technical details unless the user asked about them
5. If the result is empty, say so clearly and suggest why that might be
6. Never make up data that isn't in the results
7. Format numbers clearly — use commas for thousands, 2 decimal places for currency`

// ─── Blocked Response ─────────────────────────────────────────────────────────
function buildBlockedResponse(reason: string): string {
  if (reason.startsWith('CANNOT_ANSWER:')) {
    return reason.replace(/^CANNOT_ANSWER:\s*/i, '').trim()
  }

  return `I wasn't able to run that query because it contains operations that aren't permitted. Only read-only SELECT queries are allowed.\n\nReason: ${reason}`
}

// ─── Failed Response ──────────────────────────────────────────────────────────
function buildFailedResponse(
  nlQuery: string,
  attempts: AgentStateType['sqlAttempts']
): string {
  const attemptCount = attempts.length
  const lastError = attempts[attemptCount - 1]?.error ?? 'Unknown error'

  return `I tried ${attemptCount} time${attemptCount > 1 ? 's' : ''} to generate a working SQL query for "${nlQuery}" but wasn't able to complete it.\n\nLast error: ${lastError}\n\nTry rephrasing your question or check whether the relevant tables and columns exist in your schema.`
}

// ─── Result Summarizer ────────────────────────────────────────────────────────
function summarizeResults(queryResult: QueryResult): string {
  const {
    rows,
    rowCount,
    returnedRowCount,
    fields,
    isTruncated,
  } = queryResult

  if (rowCount === 0) {
    return 'The query returned no results.'
  }

  const SAMPLE_SIZE = 20
  const sampledRows = rows.slice(0, SAMPLE_SIZE)
  const isSampleTrimmed = returnedRowCount > SAMPLE_SIZE

  const lines: string[] = []

  lines.push(`Fields: ${fields.join(', ')}`)
  lines.push(`Total matching rows: ${rowCount}`)
  lines.push(`Rows available in execution result: ${returnedRowCount}${isTruncated ? ' (execution result was truncated before response generation)' : ''}`)
  lines.push(`Rows shown to you in this summary: ${sampledRows.length}${isSampleTrimmed ? ` (showing first ${SAMPLE_SIZE})` : ''}`)
  lines.push('')
  lines.push('Results:')
  lines.push(JSON.stringify(sampledRows, null, 2))

  return lines.join('\n')
}

// ─── Fallback Response Builder ────────────────────────────────────────────────
function buildFallbackResponse(state: AgentStateType): string {
  if (!state.queryResult) {
    return 'Something went wrong while processing your query. Please try again.'
  }

  const {
    rows,
    rowCount,
    returnedRowCount,
    fields,
    isTruncated,
  } = state.queryResult

  if (rowCount === 0) {
    return 'Your query returned no results.'
  }

  const lines: string[] = []
  lines.push(`Your query matched ${rowCount} row${rowCount > 1 ? 's' : ''}.`)

  if (isTruncated) {
    lines.push(`Showing the first ${returnedRowCount} row${returnedRowCount > 1 ? 's' : ''} due to the result size limit.`)
  }

  lines.push(`Fields: ${fields.join(', ')}`)

  if (returnedRowCount === 1 && rows.length === 1) {
    lines.push('')
    lines.push('Result:')
    for (const [key, value] of Object.entries(rows[0])) {
      lines.push(`  ${key}: ${value}`)
    }
  }

  return lines.join('\n')
}

// ─── generateResponse Node ────────────────────────────────────────────────────
export async function generateResponseNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  console.log('[generateResponse] Building final response...')

  // ── Case 1: Query was blocked upstream ────────────────────────────────────
  if (state.isBlocked) {
    const response = buildBlockedResponse(state.blockedReason)
    console.log('[generateResponse] Returning blocked response')
    return { finalResponse: response }
  }

  // ── Case 2: Attempts were made but no successful result was produced ──────
  if (!state.queryResult && state.sqlAttempts.length > 0) {
    const response = buildFailedResponse(state.nlQuery, state.sqlAttempts)
    console.log('[generateResponse] Returning failed response')
    return { finalResponse: response }
  }

  // ── Case 3: No result and no attempts — unexpected state ──────────────────
  if (!state.queryResult) {
    return {
      finalResponse: 'Something went wrong while processing your query. Please try again.',
    }
  }

  // ── Case 4: Successful execution — generate natural language answer ───────
  const resultSummary = summarizeResults(state.queryResult)

  const userPrompt = `QUESTION:
${state.nlQuery}

SQL EXECUTED:
${state.currentSql}

QUERY RESULTS:
${resultSummary}

Write a clear, direct answer to the question based only on these results.`

  try {
    const result = await generateCompletion(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt: RESPONSE_SYSTEM_PROMPT,
        maxTokens: 512,
        temperature: 0.3,
      }
    )

    console.log('[generateResponse] ✅ Response generated')

    return {
      finalResponse: result.text.trim(),
    }
  } catch (error) {
    const fallback = buildFallbackResponse(state)
    console.error('[generateResponse] LLM failed, using fallback:', error)
    return { finalResponse: fallback }
  }
}