// src/agents/nodes/validate-sql.test.ts

import 'dotenv/config'
import { AgentStateType } from '../state'
import { validateSQLNode } from './validator-sql.node'


// ─── Test Cases ───────────────────────────────────────────────────────────────
const TEST_CASES = [
  {
    label:       'Valid simple SELECT',
    currentSql:  'SELECT id, email FROM users LIMIT 10',
    expectBlock: false,
  },
  {
    label:       'Valid CTE SELECT',
    currentSql:  `
      WITH recent_users AS (
        SELECT id, createdAt
        FROM users
        WHERE createdAt >= NOW() - INTERVAL '7 days'
      )
      SELECT COUNT(*) AS total_recent_users
      FROM recent_users
    `,
    expectBlock: false,
  },
  {
    label:       'Block DML query',
    currentSql:  'DELETE FROM users WHERE id = 1',
    expectBlock: true,
    expectedReasonIncludes: 'Only read-only SELECT queries are allowed',
  },
  {
    label:       'Block multiple statements',
    currentSql:  'SELECT id, email FROM users; DROP TABLE users;',
    expectBlock: true,
    expectedReasonIncludes: 'Multiple SQL statements are not allowed',
  },
  {
    label:       'Block incomplete SQL',
    currentSql:  'SELECT * FROM',
    expectBlock: true,
    expectedReasonIncludes: 'SQL appears truncated or incomplete',
  },
  {
    label:       'Block CANNOT_ANSWER output',
    currentSql:  'CANNOT_ANSWER: schema missing required table',
    expectBlock: true,
    expectedReasonIncludes: 'CANNOT_ANSWER:',
    expectedFinalResponse: 'schema missing required table',
  },
  {
    label:       'Block markdown fenced SQL',
    currentSql:  '```sql\nSELECT id FROM users\n```',
    expectBlock: true,
    expectedReasonIncludes: 'markdown fences',
  },
  {
    label:       'Block unbalanced parentheses',
    currentSql:  'SELECT (id, email FROM users',
    expectBlock: true,
    expectedReasonIncludes: 'unbalanced parentheses or quotes',
  },
]

// ─── Single Test Runner ───────────────────────────────────────────────────────
async function runTest(
  testCase: (typeof TEST_CASES)[number],
  baseState: Partial<AgentStateType>
) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`TEST: ${testCase.label}`)
  console.log('─'.repeat(60))
  console.log('INPUT SQL:')
  console.log(testCase.currentSql)

  const state: AgentStateType = {
    ...baseState,
    currentSql:     testCase.currentSql,
    isBlocked:      false,
    blockedReason:  '',
    lastError:      '',
    finalResponse:  '',
  } as AgentStateType

  const result = await validateSQLNode(state)

  const isBlocked = result.isBlocked ?? false
  const blockedReason = result.blockedReason ?? ''
  const finalResponse = result.finalResponse ?? ''

  // Check 1: Block expectation
  if (isBlocked !== testCase.expectBlock) {
    console.error(
      `❌ Expected isBlocked=${testCase.expectBlock}, got isBlocked=${isBlocked}`
    )
    return false
  }
  console.log(`✅ Block status correct (${isBlocked ? 'blocked' : 'passed'})`)

  // Check 2: For allowed queries, blockedReason should be empty
  if (!testCase.expectBlock) {
    if (blockedReason !== '') {
      console.error(`❌ Expected empty blockedReason, got: "${blockedReason}"`)
      return false
    }
    console.log('✅ Allowed query has empty blockedReason')
  }

  // Check 3: For blocked queries, reason should exist and match expectation
  if (testCase.expectBlock) {
    if (!blockedReason || blockedReason.trim() === '') {
      console.error('❌ Query was blocked but blockedReason is empty')
      return false
    }
    console.log('✅ Blocked query has blockedReason')

    if (
      testCase.expectedReasonIncludes &&
      !blockedReason.includes(testCase.expectedReasonIncludes)
    ) {
      console.error(
        `❌ blockedReason does not include expected text\n   Expected to include: "${testCase.expectedReasonIncludes}"\n   Got: "${blockedReason}"`
      )
      return false
    }
    console.log('✅ blockedReason contains expected text')
  }

  // Check 4: finalResponse handling
  if (testCase.expectedFinalResponse !== undefined) {
    if (finalResponse !== testCase.expectedFinalResponse) {
      console.error(
        `❌ finalResponse mismatch\n   Expected: "${testCase.expectedFinalResponse}"\n   Got: "${finalResponse}"`
      )
      return false
    }
    console.log('✅ finalResponse matches expected output')
  } else {
    if (testCase.expectBlock) {
      if (!finalResponse || finalResponse.trim() === '') {
        console.error('❌ Blocked query should set finalResponse')
        return false
      }
      console.log('✅ Blocked query sets finalResponse')
    }
  }

  // ─── Print Result ─────────────────────────────────────────────────────────
  console.log('\nVALIDATION RESULT:')
  console.log({
    isBlocked,
    blockedReason,
    finalResponse,
  })

  return true
}

// ─── Main Test Runner ─────────────────────────────────────────────────────────
async function test() {
  console.log('Testing validateSQL node...\n')

  const baseState: Partial<AgentStateType> = {
    connectionId:        'e624a093-a79c-4a1e-a603-bf513e5c93f1',
    userId:              'seed-user-001',
    nlQuery:             '',
    relevantTables:      [],
    conversationHistory: [],
    sqlAttempts:         [],
    retryCount:          0,
    lastError:           '',
    currentSql:          '',
    isBlocked:           false,
    blockedReason:       '',
    finalResponse:       '',
    queryResult:         null,
    startedAt:           Date.now(),
  }

  const results: boolean[] = []

  for (const testCase of TEST_CASES) {
    const passed = await runTest(testCase, baseState)
    results.push(passed)
  }

  const passed = results.filter(Boolean).length
  const failed = results.length - passed

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`RESULTS: ${passed}/${results.length} passed`)

  if (failed > 0) {
    console.error(`❌ ${failed} test(s) failed`)
    process.exit(1)
  }

  console.log('🎉 All validateSQL tests passed')
  process.exit(0)
}

test().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})