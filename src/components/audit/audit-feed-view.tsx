'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  AuditDetailDrawer,
  AuditFilterBar,
  AuditTable,
  useAuditFeed,
  type AuditFilters,
  type AuditConnectionOption,
  type AuditLogItem,
} from '@/components/audit'
import type { QueryStatus } from '@/generated/prisma/enums'

type AuditFeedViewProps = {
  connections: AuditConnectionOption[]
  initialFilters: AuditFilters
  statusOptions?: QueryStatus[]
  emptyTitle: string
  emptyDescription: string
  /** Show an "Open in chat" action in the detail drawer (Query History). */
  enableOpenInChat?: boolean
  /** Show a CSV export of the currently-loaded rows (Audit Logs). */
  enableExport?: boolean
}

function toCsv(items: AuditLogItem[]): string {
  const header = ['Time', 'Connection', 'Status', 'Query', 'Final SQL', 'Rows', 'Duration (ms)', 'Masked columns', 'Error']
  const escape = (value: unknown) => {
    let text = value == null ? '' : String(value)
    // Neutralize spreadsheet formula injection: a leading =, +, -, @, tab, or
    // CR makes Excel/Sheets evaluate the cell as a formula even when quoted.
    // nlQuery is fully user-authored and errorMessage can carry provider text.
    if (/^[=+\-@\t\r]/.test(text)) {
      text = `'${text}`
    }
    return `"${text.replace(/"/g, '""')}"`
  }
  const rows = items.map(item => [
    item.createdAt,
    item.connectionLabel,
    item.status,
    item.nlQuery,
    item.finalSql ?? '',
    item.rowCount ?? '',
    item.executionMs ?? '',
    item.maskedColumns.join('; '),
    item.errorMessage ?? '',
  ].map(escape).join(','))
  return [header.map(escape).join(','), ...rows].join('\n')
}

export function AuditFeedView({
  connections,
  initialFilters,
  statusOptions,
  emptyTitle,
  emptyDescription,
  enableOpenInChat = false,
  enableExport = false,
}: AuditFeedViewProps) {
  const router = useRouter()
  const { filters, setFilters, items, hasMore, isLoading, isLoadingMore, error, loadMore } = useAuditFeed(initialFilters)
  const [selected, setSelected] = useState<AuditLogItem | null>(null)

  function handleExport() {
    if (items.length === 0) return
    const blob = new Blob([toCsv(items)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `datavue-audit-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-[24px] border border-[#E5E0D4] bg-[#FCFAF5] p-4 lg:flex-row lg:items-end lg:justify-between">
        <AuditFilterBar filters={filters} connections={connections} onChange={setFilters} statusOptions={statusOptions} />
        {enableExport ? (
          <button
            type="button"
            onClick={handleExport}
            disabled={items.length === 0}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#313852] px-5 text-sm font-medium text-[#313852] transition-colors hover:bg-[#F7F4EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
              <path d="M12 4v10m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 19h14" strokeLinecap="round" />
            </svg>
            Export loaded rows
          </button>
        ) : null}
      </div>

      {error ? (
        <div role="alert" className="rounded-[16px] border border-[#F5B6B0] bg-[#FFF1EF] px-4 py-3 text-sm text-[#9F2F25]">
          {error}
        </div>
      ) : null}

      <AuditTable
        items={items}
        isLoading={isLoading}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onSelect={setSelected}
        onLoadMore={loadMore}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />

      <AuditDetailDrawer
        item={selected}
        onClose={() => setSelected(null)}
        onOpenInChat={
          enableOpenInChat
            ? item => router.push(`/chat/${item.connectionId}`)
            : undefined
        }
      />
    </div>
  )
}
