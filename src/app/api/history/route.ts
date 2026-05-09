import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import { ApiError } from '@/lib/api-error'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import prisma from '@/lib/prisma'
import { QueryStatus } from '@/generated/prisma/enums'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await requireCurrentUser()

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)))
  const connectionId = url.searchParams.get('connectionId') || undefined
  const status = url.searchParams.get('status') || undefined
  const search = url.searchParams.get('search') || undefined
  const days = url.searchParams.get('days') || undefined

  // Build where clause
  const where: Record<string, unknown> = { userId: user.id }

  if (connectionId) {
    where.connectionId = connectionId
  }

  if (status) {
    const statuses = status.split(',').filter(s => Object.values(QueryStatus).includes(s as QueryStatus))
    if (statuses.length > 0) {
      where.status = { in: statuses }
    }
  }

  if (search) {
    where.nlQuery = { contains: search, mode: 'insensitive' }
  }

  if (days) {
    const daysNum = parseInt(days, 10)
    if (!isNaN(daysNum) && daysNum > 0) {
      const since = new Date()
      since.setDate(since.getDate() - daysNum)
      where.createdAt = { gte: since }
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        connection: { select: { id: true, label: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  // Compute stats
  const statsWhere = { ...where }
  const [totalQueries, successCount, blockedCount, avgExecution] = await Promise.all([
    prisma.auditLog.count({ where: statsWhere }),
    prisma.auditLog.count({ where: { ...statsWhere, status: 'SUCCESS' } }),
    prisma.auditLog.count({ where: { ...statsWhere, status: 'BLOCKED' } }),
    prisma.auditLog.aggregate({ where: { ...statsWhere, executionMs: { not: null } }, _avg: { executionMs: true } }),
  ])

  const items = logs.map(log => ({
    id: log.id,
    nlQuery: log.nlQuery,
    status: log.status,
    finalSql: log.finalSql,
    executionMs: log.executionMs,
    rowCount: log.rowCount,
    maskedColumns: log.maskedColumns,
    createdAt: log.createdAt.toISOString(),
    connection: log.connection,
  }))

  return NextResponse.json({
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      totalQueries,
      successRate: totalQueries > 0 ? Math.round((successCount / totalQueries) * 100) : 0,
      avgExecutionMs: Math.round(avgExecution._avg.executionMs || 0),
      blockedCount,
    },
  })
})
