import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
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

// Page/layout-level guard: redirect to sign-in instead of throwing an ApiError.
// Use this in Server Components. Use requireCurrentUser() in API routes where
// withErrorHandler turns the thrown ApiError into a 401 JSON response.
export async function requireUserOrRedirect() {
  const session = await getAuthSession()

  if (!session) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect('/sign-in')
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
