import { NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import prisma from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/server/resolve-user'

export const POST = withErrorHandler(async () => {
  const user = await requireCurrentUser()

  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingComplete: true },
  })

  return NextResponse.json({ ok: true })
})
