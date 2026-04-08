import 'dotenv/config'
import { anthropic } from '@ai-sdk/anthropic'
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

export type SupportedLLMProvider = 'ANTHROPIC' | 'OLLAMA' | 'GROQ'

export interface LLMMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface CompletionOptions {
  maxTokens?: number
  maxOutputTokens?: number
  temperature?: number
  systemPrompt?: string
}

export interface CompletionResult {
  text: string
  provider: SupportedLLMProvider
  model: string
}

interface ResolvedModel {
  model: Parameters<typeof generateText>[0]['model']
  provider: SupportedLLMProvider
  modelId: string
}

function toLanguageModel(model: unknown): Parameters<typeof generateText>[0]['model'] {
  return model as Parameters<typeof generateText>[0]['model']
}

const DEFAULT_PROVIDER: SupportedLLMProvider = 'GROQ'

function getProvider(): SupportedLLMProvider {
  const provider = process.env.LLM_PROVIDER?.trim().toUpperCase() ?? DEFAULT_PROVIDER

  switch (provider) {
    case 'ANTHROPIC':
    case 'OLLAMA':
    case 'GROQ':
      return provider
    default:
      throw new Error(
        `Unknown LLM_PROVIDER: "${provider}". Must be ANTHROPIC, OLLAMA, or GROQ.`
      )
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required when using the configured LLM provider`)
  }

  return value
}

async function getModel(): Promise<ResolvedModel> {
  const provider = getProvider()

  switch (provider) {
    case 'ANTHROPIC': {
      requireEnv('ANTHROPIC_API_KEY')

      const modelId = process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-4-20250514'

      return {
        model: toLanguageModel(anthropic(modelId)),
        provider,
        modelId,
      }
    }

    case 'GROQ': {
      requireEnv('GROQ_API_KEY')

      const modelId = process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile'

      return {
        model: toLanguageModel(groq(modelId)),
        provider,
        modelId,
      }
    }

    case 'OLLAMA': {
      const modelId = process.env.OLLAMA_MODEL?.trim() || 'sqlcoder'

      try {
        const { ollama } = await import('ollama-ai-provider')

        return {
          model: toLanguageModel(ollama(modelId)),
          provider,
          modelId,
        }
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(
            `Failed to load Ollama provider. Install \`ollama-ai-provider\` to use LLM_PROVIDER=OLLAMA. ${error.message}`
          )
        }

        throw new Error(
          'Failed to load Ollama provider. Install `ollama-ai-provider` to use LLM_PROVIDER=OLLAMA.'
        )
      }
    }
  }
}

export async function generateCompletion(
  messages: LLMMessage[],
  options: CompletionOptions = {}
): Promise<CompletionResult> {
  const { model, provider, modelId } = await getModel()
  const maxOutputTokens = options.maxOutputTokens ?? options.maxTokens ?? 1024

  const { text } = await generateText({
    model,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    system: options.systemPrompt,
    maxOutputTokens,
    temperature: options.temperature ?? 0,
  })

  return {
    text,
    provider,
    model: modelId,
  }
}
