import { NextRequest, NextResponse } from 'next/server'
import { ApiError } from '@/lib/api-error'
import { withErrorHandler } from '@/lib/api-handler'
import { previewOwnedConnectionTable } from '@/lib/server/table-preview'
import { requireCurrentUser } from '@/lib/server/resolve-user'

export const GET = withErrorHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ connectionId: string; tableId: string }> },
  ) => {
    const user = await requireCurrentUser()
    const { connectionId, tableId } = await params
    const { searchParams } = new URL(req.url)
    const rawLimit = searchParams.get('limit')
    const limit = rawLimit ? Number(rawLimit) : undefined

    if (rawLimit !== null && !Number.isFinite(limit)) {
      throw new ApiError('INVALID_LIMIT', 'Limit must be a number', 400)
    }

    const preview = await previewOwnedConnectionTable({
      userId: user.id,
      connectionId,
      tableId,
      limit,
    })

    return NextResponse.json({ preview })
  },
)
