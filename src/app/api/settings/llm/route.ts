import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import { ApiError } from '@/lib/api-error'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import prisma from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'
import { LLMProvider } from '@/generated/prisma/enums'

export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const user = await requireCurrentUser()

  const body = await req.json() as { provider?: string; apiKey?: string; modelOverride?: string }
  const { provider, apiKey, modelOverride } = body

  if (provider && !Object.values(LLMProvider).includes(provider as LLMProvider)) {
    throw new ApiError('INVALID_INPUT', `Invalid provider: ${provider}. Must be one of: ${Object.values(LLMProvider).join(', ')}`, 400)
  }

  const data: Record<string, unknown> = {}

  if (provider) {
    data.llmProvider = provider as LLMProvider
  }

  if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0) {
    try {
      data.encryptedApiKey = encrypt(apiKey.trim())
    } catch {
      throw new ApiError('ENCRYPTION_FAILED', 'Failed to encrypt API key', 500)
    }
  }

  // Allow clearing the key by passing empty string explicitly
  if (apiKey === '') {
    data.encryptedApiKey = null
  }

  // modelOverride is stored as part of the user — but schema doesn't have it yet
  // For now we only persist provider and key
  void modelOverride

  await prisma.user.update({
    where: { id: user.id },
    data,
  })

  return NextResponse.json({ success: true })
})
