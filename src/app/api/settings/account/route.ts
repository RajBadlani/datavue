import { NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import prisma from '@/lib/prisma'

export const DELETE = withErrorHandler(async () => {
  const user = await requireCurrentUser()

  // Delete all user data (cascades handle related records)
  await prisma.user.delete({
    where: { id: user.id },
  })

  return NextResponse.json({ success: true })
})
