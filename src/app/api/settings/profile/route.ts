import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import { ApiError } from '@/lib/api-error'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import prisma from '@/lib/prisma'

export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const user = await requireCurrentUser()

  const body = await req.json() as { name?: string }
  const { name } = body

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    throw new ApiError('INVALID_INPUT', 'Name is required and must be at least 1 character', 400)
  }

  if (name.trim().length > 100) {
    throw new ApiError('INVALID_INPUT', 'Name must be 100 characters or fewer', 400)
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: name.trim() },
    select: { id: true, name: true },
  })

  return NextResponse.json({ name: updated.name })
})
