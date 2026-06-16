'use client'

import { StatusPill } from '@/components/audit/status-pill'
import type { AuditLogItem } from '@/components/audit/types'

type AuditTableProps = {
  items: AuditLogItem[]
  isLoading: boolean
  hasMore: boolean
  isLoadingMore: boolean
  onSelect: (item: AuditLogItem) => void
  onLoadMore: () => void
  emptyTitle: string
  emptyDescription: string
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-[#E5E0D4]">
          <td className="px-4 py-3"><div className="h-4 w-64 animate-pulse rounded-full bg-[#F0EBE1]" /></td>
          <td className="px-4 py-3"><div className="h-4 w-28 animate-pulse rounded-full bg-[#F0EBE1]" /></td>
          <td className="px-4 py-3"><div className="h-5 w-20 animate-pulse rounded-full bg-[#F0EBE1]" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded-full bg-[#F0EBE1]" /></td>
          <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded-full bg-[#F0EBE1]" /></td>
        </tr>
      ))}
    </>
  )
}

export function AuditTable({
  items,
  isLoading,
  hasMore,
  isLoadingMore,
  onSelect,
  onLoadMore,
  emptyTitle,
  emptyDescription,
}: AuditTableProps) {
  if (!isLoading && items.length === 0) {
    return (
      <div className="rounded-[24px] border border-[#E5E0D4] bg-white p-10 text-center">
        <h2 className="text-[18px] font-semibold text-[#313852]">{emptyTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#7B7E8F]">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#C2CBD4] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E5E0D4] bg-[#F7F4EB]">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7B7E8F]">Query</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7B7E8F]">Connection</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7B7E8F]">Status</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7B7E8F]">Rows</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7B7E8F]">When</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : (
              items.map(item => (
                <tr
                  key={item.id}
                  tabIndex={0}
                  onClick={() => onSelect(item)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect(item)
                    }
                  }}
                  className="cursor-pointer border-b border-[#E5E0D4] last:border-b-0 transition-colors hover:bg-[#FCFAF5] focus:bg-[#FAF8FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5849F2]"
                >
                  <td className="max-w-md px-4 py-3">
                    <p className="truncate text-[14px] text-[#313852]" title={item.nlQuery}>{item.nlQuery}</p>
                    {item.maskedColumns.length > 0 ? (
                      <p className="mt-1 text-[11px] text-[#5849F2]">{item.maskedColumns.length} column{item.maskedColumns.length !== 1 ? 's' : ''} masked</p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[#7B7E8F]">{item.connectionLabel}</td>
                  <td className="px-4 py-3"><StatusPill status={item.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[#7B7E8F]">{item.rowCount != null ? item.rowCount.toLocaleString() : '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[#7B7E8F]">{formatTime(item.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && !isLoading ? (
        <div className="border-t border-[#E5E0D4] bg-[#FCFAF5] px-4 py-3 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex h-10 items-center rounded-full border border-[#C2CBD4] bg-white px-5 text-sm font-medium text-[#313852] transition-colors hover:bg-[#F7F4EB] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2"
          >
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
