import { generateCompletion } from '@/lib/llm'
import { AgentStateType, RelevantTable } from '../state'
import { buildSchemaString } from './schema-context.node'

// ─── System Prompt ────────────────────────────────────────────────────────────
const SCHEMA_RESPONSE_SYSTEM_PROMPT = `You are a database schema explainer inside a product called Datavue.
The user is asking about the structure of their database, not asking for a SQL query result.
You will be given:
1. The user's question
2. The database schema metadata
Your job is to explain the schema clearly in human language.
RULES:
1. Do not generate SQL
2. Explain the database in simple, structured language
3. Highlight the main entities/tables
4. Mention important relationships between tables
5. Prefer business-friendly wording when possible
6. If the user asks broadly, give a concise overview first, then key tables and relationships
7. Do not invent anything not supported by the schema metadata
8. If the schema is empty, say that clearly`

function buildFallbackSchemaResponse(tables: RelevantTable[]): string {
  if (tables.length === 0) {
    return 'I could not find schema metadata for this database.'
  }

  const tableNames = tables.map((t) => t.tableName)

  const lines: string[] = []
  lines.push(`This database contains ${tables.length} table${tables.length > 1 ? 's' : ''}: ${tableNames.join(', ')}.`)

  const relationCount = tables.reduce((acc, table) => acc + table.foreignKeys.length, 0)
  if (relationCount > 0) {
    lines.push(`There are ${relationCount} foreign-key relationship${relationCount > 1 ? 's' : ''} connecting the tables.`)
  }

  lines.push('Ask me if you want a manager-friendly summary, table-by-table explanation, or relationship overview.')
  return lines.join(' ')
}

export async function generateSchemaResponseNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  console.log('[generateSchemaResponse] Building schema explanation...')

  const schemaSummary = buildSchemaString(
    state.relevantTables,
    state.relevantTables.length,
    'detailed'
  )

  const userPrompt = `USER QUESTION:
${state.nlQuery}

SCHEMA METADATA:
${schemaSummary}

Explain the schema clearly based only on this metadata.`

  try {
    const result = await generateCompletion(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt: SCHEMA_RESPONSE_SYSTEM_PROMPT,
        maxTokens: 700,
        temperature: 0.3,
      }
    )

    return {
      finalResponse: result.text.trim(),
    }
  } catch (error) {
    console.error('[generateSchemaResponse] LLM failed, using fallback:', error)

    return {
      finalResponse: buildFallbackSchemaResponse(state.relevantTables),
    }
  }
}
