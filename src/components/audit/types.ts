import type { QueryStatus } from '@/generated/prisma/enums'

// One audit/history row as returned by GET /api/history.
export type AuditLogItem = {
  id: string
  connectionId: string
  connectionLabel: string
  dbType: string | null
  nlQuery: string
  sqlAttempts: SqlAttempt[]
  finalSql: string | null
  executionMs: number | null
  rowCount: number | null
  maskedColumns: string[]
  chartType: string | null
  status: QueryStatus
  errorMessage: string | null
  createdAt: string
}

export type SqlAttempt = {
  attempt: number
  sql: string
  error: string | null
  generatedAt: string
}

export type AuditFeedResponse = {
  items: AuditLogItem[]
  nextCursor: string | null
  hasMore: boolean
}

export type AuditConnectionOption = {
  id: string
  label: string
}

export const ALL_STATUSES: QueryStatus[] = ['SUCCESS', 'FAILED', 'BLOCKED', 'TIMEOUT']

// Status presentation. Every status pairs a color with an icon AND a text label
// so meaning never depends on color alone (DESIGN.md / WCAG AA).
export type StatusMeta = {
  label: string
  /** lucide-style key consumed by StatusIcon */
  icon: 'check' | 'x' | 'shield' | 'clock'
  text: string
  bg: string
  border: string
}

export const STATUS_META: Record<QueryStatus, StatusMeta> = {
  SUCCESS: {
    label: 'Success',
    icon: 'check',
    text: '#1C6B3C',
    bg: '#E8F8EC',
    border: '#BFE4C7',
  },
  FAILED: {
    label: 'Failed',
    icon: 'x',
    text: '#9F2F25',
    bg: '#FFF1EF',
    border: '#F5B6B0',
  },
  BLOCKED: {
    label: 'Blocked',
    icon: 'shield',
    text: '#B35B00',
    bg: '#FFF7EB',
    border: '#F5D0A3',
  },
  TIMEOUT: {
    label: 'Timeout',
    icon: 'clock',
    text: '#5F6475',
    bg: '#F1F0F4',
    border: '#C2CBD4',
  },
}

export function parseSqlAttempts(value: unknown): SqlAttempt[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((entry): SqlAttempt[] => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return []
    const record = entry as Record<string, unknown>
    const sql = typeof record.sql === 'string' ? record.sql : null
    if (!sql) return []
    return [{
      attempt: typeof record.attempt === 'number' ? record.attempt : 0,
      sql,
      error: typeof record.error === 'string' ? record.error : null,
      generatedAt: typeof record.generatedAt === 'string' ? record.generatedAt : '',
    }]
  })
}
