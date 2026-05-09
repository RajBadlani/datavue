import { NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import prisma from '@/lib/prisma'

export const DELETE = withErrorHandler(async () => {
  const user = await requireCurrentUser()

  await prisma.conversation.deleteMany({
    where: { userId: user.id },
  })

  return NextResponse.json({ success: true })
})
