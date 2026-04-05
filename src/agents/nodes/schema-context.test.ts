import 'dotenv/config'
import { schemaContextNode, buildSchemaString } from './schema-context.node'
import { AgentStateType } from '../state'

async function test() {
  console.log('Testing schemaContext node...\n')

  // ─── Mock minimal state ───────────────────────────────────────────────────
  const mockState: Partial<AgentStateType> = {
    connectionId:        'aaf10f9e-51ec-468b-b8c6-e59add6e773b',
    userId:              'seed-user-001',
    nlQuery:             'how many users are in the database',
    relevantTables:      [],
    conversationHistory: [],
  }

  // ─── Run the node ─────────────────────────────────────────────────────────
  const result = await schemaContextNode(mockState as AgentStateType)

  if (!result.relevantTables || result.relevantTables.length === 0) {
    console.error('❌ No tables returned — check your connectionId or run metadata sync first')
    process.exit(1)
  }

  console.log(`✅ Tables found: ${result.relevantTables.length}\n`)

  // ─── Print table names ────────────────────────────────────────────────────
  console.log('Table names:')
  result.relevantTables.forEach((t) => {
    console.log(`  → ${t.schemaName}.${t.tableName} (~${t.rowEstimate} rows)`)
  })

  // ─── Print the actual schema string the LLM will see ─────────────────────
  console.log('\n--- SCHEMA STRING (what the LLM sees) ---\n')
  const schemaString = buildSchemaString(
    result.relevantTables,
    result.relevantTables.length
  )
  console.log(schemaString)
  console.log('\n--- END SCHEMA STRING ---\n')

  // ─── Verify column format ─────────────────────────────────────────────────
  const lines = schemaString.split('\n')
  const malformed = lines.filter(
    (line) => (line.match(/\)/g) || []).length !== (line.match(/\(/g) || []).length
  )

  if (malformed.length > 0) {
    console.error('❌ Malformed lines detected (mismatched parentheses):')
    malformed.forEach((l) => console.error('  ', l))
  } else {
    console.log('✅ All lines have balanced parentheses')
  }

  console.log('\n🎉 schemaContext node test complete')
}

test()
  .catch(console.error)
  .finally(() => process.exit(0))