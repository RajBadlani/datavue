'use client'

import { HistoryRow } from './history-row'

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

type HistoryListProps = {
  items: AuditLogItem[]
  onSelect: (id: string) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function HistoryList({ items, onSelect, page, totalPages, onPageChange }: HistoryListProps) {
  function handleCopySql(sql: string) {
    navigator.clipboard.writeText(sql)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {items.map(item => (
          <HistoryRow
            key={item.id}
            item={item}
            onSelect={onSelect}
            onCopySql={handleCopySql}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-9 rounded-full border border-[#C2CBD4] px-3 text-[13px] font-medium text-[#313852] transition-colors hover:bg-[#F7F4EB] disabled:opacity-40"
            aria-label="Previous page"
          >
            ← Prev
          </button>
          <span className="text-[13px] text-[#7B7E8F]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-9 rounded-full border border-[#C2CBD4] px-3 text-[13px] font-medium text-[#313852] transition-colors hover:bg-[#F7F4EB] disabled:opacity-40"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
