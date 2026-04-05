import 'dotenv/config'

import { generateCompletion } from './llm'

async function test() {
  console.log('Testing LLM provider...\n')

  const result = await generateCompletion(
    [
      {
        role: 'user',
        content: 'Hello, how are you?',
      },
    ],
    {
      systemPrompt: 'You are a helpful assistant. Follow instructions exactly.',
      maxTokens: 50,
      temperature: 0,
    }
  )

  console.log('Provider:', result.provider)
  console.log('Model:   ', result.model)
  console.log('Response:', result.text)
}

test().catch(console.error)
