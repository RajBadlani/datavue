import 'dotenv/config'
import { AgentStateType } from './state'
import { agentGraph } from './graph'
import prisma from '@/lib/prisma'

async function main() {
  const input: Partial<AgentStateType> = {
    nlQuery: `Does any user exist with email rajbadlani9@gmail.com? Yes or No` ,
    connectionId: '6b0caf74-02f7-43c3-a314-ef921305a56a',
    userId: 'yU35e3ALtw87pGfBlvWf8meFLRKZHNc9',

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
  // console.dir(result, { depth: null })

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

  console.log('\n========== CHART CONFIG ==========')
  console.dir(result.chartConfig, { depth: null })

  console.log('\n========== AUDIT LOG ==========')
  console.dir(await prisma.auditLog.findMany({where: {userId: 'seed-user-001', connectionId: '02d744c8-5dfd-4862-8b54-f3ccf74ea127'}}), { depth: null })
}

main().catch((err) => {
  console.error('Fatal error while testing graph:', err)
  process.exit(1)
})