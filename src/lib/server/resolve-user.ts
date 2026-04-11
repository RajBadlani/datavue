import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Errors } from '@/lib/api-error'
import prisma from '@/lib/prisma'

export async function getAuthSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function requireAuthSession() {
  const session = await getAuthSession()

  if (!session) {
    throw Errors.UNAUTHORIZED
  }

  return session
}

export async function requireCurrentUser() {
  const session = await requireAuthSession()
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    throw Errors.UNAUTHORIZED
  }

  return user
}

export async function getCurrentUser() {
  const session = await getAuthSession()

  if (!session) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
  })
}
