import { generateResponseNode } from './generate-response.node'
import { AgentStateType, SqlAttempt, QueryResult } from '../state'

function buildBaseState(): AgentStateType {
  return {
    connectionId:        '5b4aafaf-a6fa-45fb-b664-9883ffc1011d',
    userId:              'seed-user-001',
    nlQuery:             '',
    currentSql:          '',
    relevantTables:      [],
    conversationHistory: [],
    sqlAttempts:         [],
    queryResult:         null,
    lastError:           '',
    retryCount:          0,
    isBlocked:           false,
    blockedReason:       '',
    finalResponse:       '',
    startedAt:           Date.now(),
  } as AgentStateType
}

async function test() {
  console.log('Testing generateResponse node...\n')

  // ── Test 1: Successful query with results ─────────────────────────────────
  console.log('─'.repeat(50))
  console.log('TEST 1: Successful query with results')

  const result1 = await generateResponseNode({
    ...buildBaseState(),
    nlQuery:    'How many users are in the database?',
    currentSql: 'SELECT COUNT(id) AS total_users FROM users',
    queryResult: {
      rows:     [{ total_users: '1' }],
      rowCount: 1,
      fields:   ['total_users'],
    } as QueryResult,
    sqlAttempts: [{
      attempt:     1,
      sql:         'SELECT COUNT(id) AS total_users FROM users',
      error:       null,
      generatedAt: new Date().toISOString(),
    }] as SqlAttempt[],
  } as AgentStateType)

  console.log('Response:')
  console.log(result1.finalResponse)
  console.log(result1.finalResponse ? '✅ Response generated' : '❌ Empty response')

  // ── Test 2: Blocked query ─────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('TEST 2: Blocked query')

  const result2 = await generateResponseNode({
    ...buildBaseState(),
    nlQuery:       'Drop all users',
    isBlocked:     true,
    blockedReason: 'Blocked keyword detected: DROP',
  } as AgentStateType)

  console.log('Response:')
  console.log(result2.finalResponse)
  console.log(result2.finalResponse?.includes('Only read-only SELECT queries are allowed') ? '✅ Blocked message correct' : '❌ Wrong blocked message')

  // ── Test 3: Self-heal exhausted ───────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('TEST 3: Self-heal retries exhausted')

  const result3 = await generateResponseNode({
    ...buildBaseState(),
    nlQuery:     'Show revenue by month',
    queryResult: null,
    sqlAttempts: [
      { attempt: 1, sql: 'SELECT...', error: 'column does not exist',  generatedAt: new Date().toISOString() },
      { attempt: 2, sql: 'SELECT...', error: 'relation does not exist', generatedAt: new Date().toISOString() },
      { attempt: 3, sql: 'SELECT...', error: 'syntax error',            generatedAt: new Date().toISOString() },
    ] as SqlAttempt[],
  } as AgentStateType)

  console.log('Response:')
  console.log(result3.finalResponse)
  console.log(result3.finalResponse?.includes('3 times') ? '✅ Failed message correct' : '❌ Wrong failed message')

  // ── Test 4: Empty result set ──────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('TEST 4: Query returns empty result set')

  const result4 = await generateResponseNode({
    ...buildBaseState(),
    nlQuery:    'Show me all premium users who signed up yesterday',
    currentSql: "SELECT * FROM users WHERE plan = 'premium' AND created_at >= CURRENT_DATE - 1",
    queryResult: {
      rows:     [],
      rowCount: 0,
      fields:   ['id', 'email', 'plan'],
    } as QueryResult,
    sqlAttempts: [{
      attempt:     1,
      sql:         "SELECT * FROM users WHERE plan = 'premium'",
      error:       null,
      generatedAt: new Date().toISOString(),
    }] as SqlAttempt[],
  } as AgentStateType)

  console.log('Response:')
  console.log(result4.finalResponse)
  console.log(result4.finalResponse ? '✅ Empty result handled' : '❌ Empty result not handled')

  console.log('\n' + '═'.repeat(50))
  console.log('🎉 generateResponse tests complete')
  process.exit(0)
}

test().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
