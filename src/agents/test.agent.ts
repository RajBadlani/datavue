import 'dotenv/config'
import { AgentStateType } from './state'
import { agentGraph } from './graph'

async function main() {
  const input: Partial<AgentStateType> = {
    nlQuery: 'Explain me the schema of the database',
    connectionId: '5b4aafaf-a6fa-45fb-b664-9883ffc1011d',
    userId: 'seed-user-001',

    conversationHistory: [],
    relevantTables: [],
    currentSql: '',
    sqlAttempts: [],
    isBlocked: false,
    blockedReason: '',
    queryResult: null,
    lastError: '',
    retryCount: 0,
    finalResponse: '',
    startedAt: Date.now(),
  }

  const result = await agentGraph.invoke(input)

  console.log('\n========== FINAL STATE ==========')
  console.dir(result, { depth: null })

  console.log('\n========== FINAL RESPONSE ==========')
  console.log(result.finalResponse)

  console.log('\n========== SQL ATTEMPTS ==========')
  console.dir(result.sqlAttempts, { depth: null })

  console.log('\n========== CURRENT SQL ==========')
  console.log(result.currentSql)

  console.log('\n========== LAST ERROR ==========')
  console.log(result.lastError)

  console.log('\n========== QUERY RESULT ==========')
  console.dir(result.queryResult, { depth: 3 })
}

main().catch((err) => {
  console.error('Fatal error while testing graph:', err)
  process.exit(1)
})