import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import { ApiError } from '@/lib/api-error'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import prisma from '@/lib/prisma'

export const DELETE = withErrorHandler(async (_req: NextRequest, context) => {
  const user = await requireCurrentUser()

  const { sessionId } = (context as { params: Promise<{ sessionId: string }> }).params
    ? await (context as { params: Promise<{ sessionId: string }> }).params
    : { sessionId: '' }

  if (!sessionId) {
    throw new ApiError('INVALID_INPUT', 'Session ID is required', 400)
  }

  // Verify session belongs to user
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  })

  if (!session || session.userId !== user.id) {
    throw new ApiError('NOT_FOUND', 'Session not found', 404)
  }

  await prisma.session.delete({
    where: { id: sessionId },
  })

  return NextResponse.json({ success: true })
})
