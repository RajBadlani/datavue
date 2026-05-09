'use client'

type AuditLogItem = {
  id: string
  nlQuery: string
  status: string
  finalSql: string | null
  executionMs: number | null
  rowCount: number | null
  maskedColumns: string[]
  createdAt: string
  connection: { id: string; label: string }
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function statusDotColor(status: string): string {
  switch (status) {
    case 'SUCCESS': return 'bg-[#5849F2]'
    case 'FAILED': return 'bg-[#9F2F25]'
    case 'BLOCKED': return 'bg-[#7B7E8F]'
    case 'TIMEOUT': return 'bg-amber-400'
    default: return 'bg-[#7B7E8F]'
  }
}

type HistoryRowProps = {
  item: AuditLogItem
  onSelect: (id: string) => void
  onCopySql: (sql: string) => void
}

export function HistoryRow({ item, onSelect, onCopySql }: HistoryRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="group flex w-full items-start gap-3 rounded-[16px] border border-[#C2CBD4] bg-white p-4 text-left transition-shadow hover:shadow-[0_18px_60px_rgba(49,56,82,0.05)] focus:outline-none focus:ring-2 focus:ring-[#5849F2] focus:ring-offset-2"
      aria-label={`View details for query: ${item.nlQuery.slice(0, 60)}`}
    >
      {/* Status dot */}
      <span
        className={`mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${statusDotColor(item.status)}`}
        aria-label={`Status: ${item.status.toLowerCase()}`}
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-[#313852]">
          {item.nlQuery}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[#7B7E8F]">
          <span className="rounded-full bg-[#EDEAFF] px-2 py-0.5 text-[11px] font-medium text-[#5849F2]">
            {item.connection.label}
          </span>
          <span>{formatRelativeTime(item.createdAt)}</span>
          {item.status === 'SUCCESS' && item.executionMs != null && (
            <span>{item.executionMs}ms</span>
          )}
          {item.status === 'SUCCESS' && item.rowCount != null && (
            <span>{item.rowCount} rows</span>
          )}
        </div>
      </div>

      {/* Actions on hover */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {item.finalSql && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onCopySql(item.finalSql!) }}
            className="rounded-full p-1.5 text-[#7B7E8F] hover:bg-[#EDEAFF] hover:text-[#5849F2]"
            aria-label="Copy SQL"
            title="Copy SQL"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        )}
      </div>
    </button>
  )
}
