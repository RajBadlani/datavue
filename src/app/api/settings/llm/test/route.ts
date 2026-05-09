import { NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import { ApiError } from '@/lib/api-error'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import { decrypt } from '@/lib/encryption'

export const POST = withErrorHandler(async () => {
  const user = await requireCurrentUser()

  if (!user.encryptedApiKey) {
    throw new ApiError('NO_API_KEY', 'No API key configured. Please save a key first.', 400)
  }

  let apiKey: string
  try {
    apiKey = decrypt(user.encryptedApiKey)
  } catch {
    throw new ApiError('DECRYPTION_FAILED', 'Could not decrypt stored API key', 500)
  }

  // Test based on provider
  try {
    switch (user.llmProvider) {
      case 'ANTHROPIC': {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Say hi' }],
          }),
        })
        if (!res.ok) {
          const data = await res.json() as { error?: { message?: string } }
          throw new Error(data.error?.message || `HTTP ${res.status}`)
        }
        break
      }
      case 'OPENAI': {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Say hi' }],
          }),
        })
        if (!res.ok) {
          const data = await res.json() as { error?: { message?: string } }
          throw new Error(data.error?.message || `HTTP ${res.status}`)
        }
        break
      }
      case 'OLLAMA': {
        // Ollama is local — just check if the server is reachable
        const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'
        const res = await fetch(`${ollamaUrl}/api/tags`)
        if (!res.ok) {
          throw new Error(`Ollama server returned ${res.status}`)
        }
        break
      }
      default:
        throw new Error(`Unknown provider: ${user.llmProvider}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new ApiError('LLM_TEST_FAILED', `Provider test failed: ${message}`, 400)
  }

  return NextResponse.json({ success: true })
})
