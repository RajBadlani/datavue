import 'dotenv/config'
import { schemaContextNode } from './schema-context.node'
import { generateSQLNode } from './generate-sql.node'
import { AgentStateType } from '../state'

// ─── Test Cases ───────────────────────────────────────────────────────────────
const TEST_QUERIES = [
  {
    label:    'Simple count',
    nlQuery:  'How many users are in the database?',
  },
  {
    label:    'Filter query',
    nlQuery:  'Show me all connections that have been successfully synced',
  },
  {
    label:    'Multi table join',
    nlQuery:  'Show me all audit logs along with the email of the user who made the query',
  },
  {
    label:    'Aggregation',
    nlQuery:  'How many audit logs are there per connection?',
  },
  {
    label:    'Self heal simulation — bad column name',
    nlQuery:  'Show me all users',
    // Simulate a self-heal scenario by injecting a previous failed attempt
    simulateSelfHeal: true,
    failedSql:        'SELECT id, email, phone FROM users LIMIT 10',
    errorMessage:     'ERROR: column "phone" does not exist',
  },
]

async function runTest(
  testCase: (typeof TEST_QUERIES)[number],
  baseState: Partial<AgentStateType>
) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`TEST: ${testCase.label}`)
  console.log(`QUERY: "${testCase.nlQuery}"`)
  console.log('─'.repeat(60))

  // ─── Build state for this test ──────────────────────────────────────────
  const state: AgentStateType = {
    ...baseState,
    nlQuery:     testCase.nlQuery,
    currentSql:  testCase.simulateSelfHeal ? testCase.failedSql!  : '',
    lastError:   testCase.simulateSelfHeal ? testCase.errorMessage! : '',
    retryCount:  testCase.simulateSelfHeal ? 1 : 0,
    sqlAttempts: [],
  } as AgentStateType

  // ─── Run the node ────────────────────────────────────────────────────────
  const result = await generateSQLNode(state)

  // ─── Validate output ─────────────────────────────────────────────────────
  const sql = result.currentSql ?? ''
  const attempts = result.sqlAttempts ?? []

  // Check 1: SQL was generated
  if (!sql || sql.trim() === '') {
    console.error('❌ No SQL generated')
    return false
  }
  console.log('✅ SQL generated')

  // Check 2: No markdown fences leaked through
  if (sql.includes('```')) {
    console.error('❌ SQL contains markdown fences — cleaning failed')
    console.error('   Got:', sql)
    return false
  }
  console.log('✅ No markdown fences')

  // Check 3: Only SELECT statements
  const firstWord = sql.trim().split(/\s+/)[0].toUpperCase()
  if (firstWord !== 'SELECT') {
    console.warn(`⚠️  First keyword is "${firstWord}" not SELECT — review this`)
  } else {
    console.log('✅ Starts with SELECT')
  }

  // Check 4: Attempt was recorded
  if (attempts.length === 0) {
    console.error('❌ No attempt recorded in sqlAttempts')
    return false
  }
  console.log(`✅ Attempt recorded (attempt #${attempts[0].attempt})`)

  // Check 5: Self-heal mode logged correctly
  if (testCase.simulateSelfHeal) {
    if (attempts[0].attempt !== 2) {
      console.error(`❌ Expected attempt #2 for self-heal, got #${attempts[0].attempt}`)
      return false
    }
    console.log('✅ Self-heal attempt numbered correctly')
  }

  // ─── Print the generated SQL ─────────────────────────────────────────────
  console.log('\nGENERATED SQL:')
  console.log(sql)

  return true
}

async function test() {
  console.log('Testing generateSQL node...\n')

  // ─── Step 1: Run schemaContext first to get relevant tables ───────────────
  console.log('Loading schema context...')

  const schemaState = await schemaContextNode({
    connectionId:        'e624a093-a79c-4a1e-a603-bf513e5c93f1',
    userId:              'seed-user-001',
    nlQuery:             '',
    relevantTables:      [],
    conversationHistory: [],
  } as unknown as AgentStateType)

  if (!schemaState.relevantTables || schemaState.relevantTables.length === 0) {
    console.error('❌ schemaContext returned no tables — run metadata sync first')
    process.exit(1)
  }

  console.log(`✅ Schema loaded — ${schemaState.relevantTables.length} tables\n`)

  // ─── Step 2: Build base state shared across all tests ─────────────────────
  const baseState: Partial<AgentStateType> = {
    connectionId:        'e624a093-a79c-4a1e-a603-bf513e5c93f1',
    userId:              'seed-user-001',
    relevantTables:      schemaState.relevantTables,
    conversationHistory: [],
    sqlAttempts:         [],
    retryCount:          0,
    lastError:           '',
    currentSql:          '',
  }

  // ─── Step 3: Run all test cases ───────────────────────────────────────────
  const results: boolean[] = []

  for (const testCase of TEST_QUERIES) {
    const passed = await runTest(testCase, baseState)
    results.push(passed)
  }

  // ─── Step 4: Summary ──────────────────────────────────────────────────────
  const passed = results.filter(Boolean).length
  const failed = results.length - passed

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`RESULTS: ${passed}/${results.length} passed`)

  if (failed > 0) {
    console.error(`❌ ${failed} test(s) failed`)
    process.exit(1)
  }

  console.log('🎉 All generateSQL tests passed')
  process.exit(0)
}

test().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})