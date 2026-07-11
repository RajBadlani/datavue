import { generateCompletion } from '@/lib/llm'
import { AgentStateType, ChartConfig } from '../state'

// ─── LLM Prompt ───────────────────────────────────────────────────────────────
const VISUALIZATION_SYSTEM_PROMPT = `You are a data visualization expert for a product called DatavueX.

You will be given:
1. The user's original question
2. The SQL query that was executed
3. The query result shape (fields and sample rows)

Your job is to decide whether a chart can and should be created for this data.

CHART TYPES YOU CAN USE:
- line      : time series data, trends over time
- bar       : categorical comparisons
- pie       : proportional distribution, max 8 segments
- area      : cumulative or stacked time series
- scatter   : correlation between two numeric values
- table     : raw data that needs to be read row by row
- metric_card : single important number with a label
- none      : cannot be visualized meaningfully as a chart

RULES (in priority order):
1. If the user explicitly asked for a specific chart type (line, bar, pie, area, scatter, table), return THAT type whenever the result can support it. An explicit request outranks every rule below. A multi-row time series (a date/time column plus a numeric column) always supports the requested line or area chart.
2. If the result is empty → return none.
3. If the result is a single number AND the user did NOT request a specific chart type → return metric_card.
4. If the data has more than 5 columns → prefer table (unless a specific chart type was requested and supported).
5. If the data has more than 50 rows and no aggregation → prefer table (unless a specific chart type was requested and supported).
6. Only return none when the data genuinely cannot support ANY chart (e.g. a single scalar with no requested chart type). Do not return none just to avoid a requested chart that the data can actually support.
7. For metric_card include the value and a clean human readable label.
8. For all other chart types include xKey and yKey (field names from the result).

RESPONSE FORMAT:
Return ONLY a valid JSON object. No explanation. No markdown. No code fences.

Examples of correct output:
{"type":"metric_card","value":"1,247","label":"Total Users"}
{"type":"line","xKey":"date","yKey":"signups","xLabel":"Date","yLabel":"Signups","title":"Daily Signups"}
{"type":"bar","xKey":"category","yKey":"revenue","xLabel":"Category","yLabel":"Revenue","title":"Revenue by Category"}
{"type":"none"}
{"type":"table"}`

// ─── detectVisualization Node ─────────────────────────────────────────────────
export async function detectVisualizationNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {

  // ── Skip if no result ────────────────────────────────────────────────────
  // Blocked or failed queries have nothing to visualize
  if (!state.queryResult) {
    console.log('[detectVisualization] No query result — skipping')
    return { chartConfig: null }
  }

  const { rows, fields, rowCount } = state.queryResult

  // ── Skip if empty result ─────────────────────────────────────────────────
  if (rowCount === 0 || fields.length === 0) {
    console.log('[detectVisualization] Empty result — returning none')
    return { chartConfig: { type: 'none' } }
  }

  console.log(
    `[detectVisualization] Analyzing — ${rowCount} rows, fields: [${fields.join(', ')}]`
  )

  // ── Build prompt ─────────────────────────────────────────────────────────
  // Send only first 5 rows as sample — LLM doesn't need all rows to decide
  const sampleRows = rows.slice(0, 5)
  const userPrompt = `USER QUESTION: ${state.nlQuery}

SQL EXECUTED:
${state.currentSql}

RESULT SHAPE:
Fields: ${fields.join(', ')}
Total rows returned: ${rowCount}
Sample rows (first 5):
${JSON.stringify(sampleRows, null, 2)}

Decide the best visualization for this data.`

  // ── Call LLM ──────────────────────────────────────────────────────────────
  try {
    const result = await generateCompletion(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt: VISUALIZATION_SYSTEM_PROMPT,
        maxTokens: 200,
        temperature: 0,  // deterministic — same data should always give same chart
      }
    )

    // ── Parse response ───────────────────────────────────────────────────────
    const cleaned = result.text
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim()

    const chartConfig = JSON.parse(cleaned) as ChartConfig

    console.log(`[detectVisualization] Decision: ${chartConfig.type}`)

    return { chartConfig }

  } catch (error) {
    // LLM failed or returned invalid JSON
    // Default to table — never fails, always shows the data
    console.error('[detectVisualization] Failed — defaulting to table:', error)
    return {
      chartConfig: { type: 'table' },
    }
  }
}