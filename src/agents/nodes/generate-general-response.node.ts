import { generateCompletion } from '@/lib/llm'
import { AgentStateType } from '../state'

// ─── System Prompt ────────────────────────────────────────────────────────────
const GENERAL_RESPONSE_SYSTEM_PROMPT = `You are a helpful assistant inside a database product called Datavue.
The user may ask for:
- greetings
- casual chat
- general database concepts
- simple explanations
- non-database questions

RULES:
1. Be clear, short, and helpful
2. Do not mention internal agent flow, SQL generation, or schema processing
3. If the user asks a general knowledge question, answer it directly
4. If the user asks something unrelated to the connected database, still respond naturally
5. If the user asks about time, avoid pretending you know live runtime time unless it is explicitly provided in context
6. Keep the tone simple and natural`

function buildFallbackGeneralResponse(nlQuery: string): string {
  const normalized = nlQuery.trim().toLowerCase()

  if (['hi', 'hello', 'hey', 'hii', 'yo'].includes(normalized)) {
    return 'Hi! How can I help you with your database or schema?'
  }

  if (['thanks', 'thank you', 'thx'].includes(normalized)) {
    return 'You’re welcome!'
  }

  return 'I’m here to help. Ask me about your database, its schema, or any data you want to query.'
}

export async function generateGeneralResponseNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  console.log('[generateGeneralResponse] Building general response...')

  const userPrompt = `USER MESSAGE:
${state.nlQuery}

Respond naturally and helpfully.`

  try {
    const result = await generateCompletion(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt: GENERAL_RESPONSE_SYSTEM_PROMPT,
        maxTokens: 300,
        temperature: 0.4,
      }
    )

    return {
      finalResponse: result.text.trim(),
    }
  } catch (error) {
    console.error('[generateGeneralResponse] LLM failed, using fallback:', error)

    return {
      finalResponse: buildFallbackGeneralResponse(state.nlQuery),
    }
  }
}