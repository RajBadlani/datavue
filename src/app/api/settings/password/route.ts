import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import { ApiError } from '@/lib/api-error'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export const POST = withErrorHandler(async (req: NextRequest) => {
  await requireCurrentUser()

  const body = await req.json() as { currentPassword?: string; newPassword?: string }
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    throw new ApiError('INVALID_INPUT', 'Current password and new password are required', 400)
  }

  if (newPassword.length < 8) {
    throw new ApiError('INVALID_INPUT', 'New password must be at least 8 characters', 400)
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: { currentPassword, newPassword },
    })
  } catch {
    throw new ApiError('PASSWORD_CHANGE_FAILED', 'Failed to change password. Check your current password.', 400)
  }

  return NextResponse.json({ success: true })
})
