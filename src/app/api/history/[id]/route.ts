import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import { ApiError } from '@/lib/api-error'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import prisma from '@/lib/prisma'

export const GET = withErrorHandler(async (req: NextRequest, context) => {
  const user = await requireCurrentUser()

  const { id } = await (context as { params: Promise<{ id: string }> }).params

  if (!id) {
    throw new ApiError('INVALID_INPUT', 'Audit log ID is required', 400)
  }

  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: {
      connection: { select: { id: true, label: true } },
    },
  })

  if (!log || log.userId !== user.id) {
    throw new ApiError('NOT_FOUND', 'Audit log not found', 404)
  }

  return NextResponse.json({
    id: log.id,
    nlQuery: log.nlQuery,
    status: log.status,
    sqlAttempts: log.sqlAttempts,
    finalSql: log.finalSql,
    executionMs: log.executionMs,
    rowCount: log.rowCount,
    maskedColumns: log.maskedColumns,
    chartType: log.chartType,
    errorMessage: log.errorMessage,
    createdAt: log.createdAt.toISOString(),
    connection: log.connection,
  })
})
