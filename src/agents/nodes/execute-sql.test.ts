import "dotenv/config"
import { executeSQLNode } from './execute-sql.node'
import { AgentStateType, SqlAttempt } from '../state'

const CONNECTION_ID = '5b4aafaf-a6fa-45fb-b664-9883ffc1011d'
const USER_ID       = 'seed-user-001'

function buildState(sql: string): AgentStateType {
  return {
    connectionId:        CONNECTION_ID,
    userId:              USER_ID,
    nlQuery:             'test query',
    currentSql:          sql,
    relevantTables:      [],
    conversationHistory: [],
    sqlAttempts:         [{
      attempt:     1,
      sql,
      error:       null,
      generatedAt: new Date().toISOString(),
    }] as SqlAttempt[],
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
  console.log('Testing executeSQL node...\n')

  // ── Test 1: Valid query ───────────────────────────────────────────────────
  console.log('─'.repeat(50))
  console.log('TEST 1: Valid SELECT query')

  const result1 = await executeSQLNode(
    buildState('SELECT id, email FROM users LIMIT 5')
  )

  if (result1.queryResult && result1.lastError === '') {
    console.log(`✅ Returned ${result1.queryResult.rowCount} rows`)
    console.log(`✅ Fields: ${result1.queryResult.fields.join(', ')}`)
    console.log('Sample row:', result1.queryResult.rows[0])
  } else {
    console.error('❌ Valid query failed:', result1.lastError)
  }

  // ── Test 2: Query with bad column ─────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('TEST 2: Query with non-existent column (should fail gracefully)')

  const result2 = await executeSQLNode(
    buildState('SELECT id, phone_number FROM users LIMIT 5')
  )

  if (result2.lastError && result2.lastError !== '') {
    console.log(`✅ Error captured correctly: ${result2.lastError}`)

    // Verify error was stamped onto the attempt
    const lastAttempt = result2.sqlAttempts?.[result2.sqlAttempts.length - 1]
    if (lastAttempt?.error) {
      console.log(`✅ Error stamped onto sqlAttempt: ${lastAttempt.error}`)
    } else {
      console.error('❌ Error was not stamped onto sqlAttempt')
    }
  } else {
    console.error('❌ Bad column query should have failed but did not')
  }

  // ── Test 3: Aggregation query ─────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('TEST 3: Aggregation query')

  const result3 = await executeSQLNode(
    buildState(`
      SELECT c.label, COUNT(a.id) AS log_count
      FROM connections c
      LEFT JOIN audit_logs a ON c.id = a."connectionId"
      GROUP BY c.label
      ORDER BY log_count DESC
      LIMIT 10
    `)
  )

  if (result3.queryResult) {
    console.log(`✅ Aggregation returned ${result3.queryResult.rowCount} rows`)
    console.log(`✅ Fields: ${result3.queryResult.fields.join(', ')}`)
  } else {
    console.error('❌ Aggregation failed:', result3.lastError)
  }

  // ── Test 4: Invalid connection ID ─────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  console.log('TEST 4: Invalid connection ID (should block)')

  const invalidState = buildState('SELECT 1')
  const result4 = await executeSQLNode({
    ...invalidState,
    connectionId: 'non-existent-id-000',
  } as AgentStateType)

  if (result4.isBlocked) {
    console.log(`✅ Invalid connection blocked correctly: ${result4.blockedReason}`)
  } else {
    console.error('❌ Invalid connection should have been blocked')
  }

  console.log('\n' + '═'.repeat(50))
  console.log('🎉 executeSQL tests complete')
  process.exit(0)
}

test().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})