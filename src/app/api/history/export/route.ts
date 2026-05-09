import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/api-handler'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import prisma from '@/lib/prisma'
import { QueryStatus } from '@/generated/prisma/enums'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await requireCurrentUser()

  const url = new URL(req.url)
  const connectionId = url.searchParams.get('connectionId') || undefined
  const status = url.searchParams.get('status') || undefined
  const search = url.searchParams.get('search') || undefined
  const days = url.searchParams.get('days') || undefined

  const where: Record<string, unknown> = { userId: user.id }

  if (connectionId) where.connectionId = connectionId
  if (status) {
    const statuses = status.split(',').filter(s => Object.values(QueryStatus).includes(s as QueryStatus))
    if (statuses.length > 0) where.status = { in: statuses }
  }
  if (search) where.nlQuery = { contains: search, mode: 'insensitive' }
  if (days) {
    const daysNum = parseInt(days, 10)
    if (!isNaN(daysNum) && daysNum > 0) {
      const since = new Date()
      since.setDate(since.getDate() - daysNum)
      where.createdAt = { gte: since }
    }
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: { connection: { select: { label: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10000,
  })

  // Build CSV
  const headers = ['Date', 'Status', 'Query', 'SQL', 'Execution (ms)', 'Rows', 'Connection']
  const rows = logs.map(log => [
    log.createdAt.toISOString(),
    log.status,
    `"${(log.nlQuery || '').replace(/"/g, '""')}"`,
    `"${(log.finalSql || '').replace(/"/g, '""')}"`,
    log.executionMs?.toString() || '',
    log.rowCount?.toString() || '',
    log.connection.label,
  ].join(','))

  const csv = [headers.join(','), ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="query-history-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
})
