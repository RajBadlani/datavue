import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withErrorHandler } from '@/lib/api-handler'
import { ApiError } from '@/lib/api-error'
import { requireCurrentUser } from '@/lib/server/resolve-user'
import { QueryStatus } from '@/generated/prisma/enums'
import { Prisma } from '@/generated/prisma/client'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

const VALID_STATUSES = new Set<string>(Object.values(QueryStatus))

function clampLimit(raw: string | null): number {
  // Treat missing/empty as "not provided" BEFORE coercion — Number(null) and
  // Number('') are both 0 (finite), which would otherwise clamp to 1 row/page.
  if (raw === null || raw.trim() === '') return DEFAULT_LIMIT
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(parsed)))
}

function parseDate(raw: string | null, label: string): Date | undefined {
  if (!raw) return undefined
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) {
    throw new ApiError('INVALID_DATE', `Invalid ${label} date`, 400)
  }
  return date
}

// ─── GET /api/history ──────────────────────────────────────────────────────
// Paginated, filtered audit-log feed scoped to the signed-in user. Backs both
// the Query History page (personal "what did I ask" log) and the Audit Logs
// page (compliance lens) — they differ only by default filters and framing.
export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await requireCurrentUser()

  const params = req.nextUrl.searchParams
  const limit = clampLimit(params.get('limit'))
  const cursor = params.get('cursor')?.trim() || null
  const connectionId = params.get('connectionId')?.trim() || null
  const statusParam = params.get('status')?.trim().toUpperCase() || null
  const from = parseDate(params.get('from'), 'from')
  const to = parseDate(params.get('to'), 'to')

  if (statusParam && !VALID_STATUSES.has(statusParam)) {
    throw new ApiError(
      'INVALID_STATUS',
      `Invalid status. Must be one of: ${Array.from(VALID_STATUSES).join(', ')}`,
      400,
    )
  }

  // Ownership is enforced here: every row is filtered by the authenticated
  // user's id, so a foreign connectionId simply matches nothing.
  const where: Prisma.AuditLogWhereInput = {
    userId: user.id,
    ...(connectionId ? { connectionId } : {}),
    ...(statusParam ? { status: statusParam as QueryStatus } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  }

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      connectionId: true,
      nlQuery: true,
      sqlAttempts: true,
      finalSql: true,
      executionMs: true,
      rowCount: true,
      maskedColumns: true,
      chartType: true,
      status: true,
      errorMessage: true,
      createdAt: true,
      connection: {
        select: {
          label: true,
          dbType: true,
        },
      },
    },
  })

  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null

  const items = page.map(row => ({
    id: row.id,
    connectionId: row.connectionId,
    connectionLabel: row.connection?.label ?? 'Unknown connection',
    dbType: row.connection?.dbType ?? null,
    nlQuery: row.nlQuery,
    sqlAttempts: row.sqlAttempts,
    finalSql: row.finalSql,
    executionMs: row.executionMs,
    rowCount: row.rowCount,
    maskedColumns: row.maskedColumns,
    chartType: row.chartType,
    status: row.status,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt,
  }))

  return NextResponse.json({ items, nextCursor, hasMore })
})
