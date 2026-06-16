'use client'

import { ALL_STATUSES, type AuditConnectionOption } from '@/components/audit/types'
import type { QueryStatus } from '@/generated/prisma/enums'
import { STATUS_META } from '@/components/audit/types'

export type AuditFilters = {
  connectionId: string
  status: string
  from: string
  to: string
}

type AuditFilterBarProps = {
  filters: AuditFilters
  connections: AuditConnectionOption[]
  onChange: (next: AuditFilters) => void
  /** Subset of statuses to surface first; defaults to all. */
  statusOptions?: QueryStatus[]
}

const selectClass =
  'h-11 rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm text-[#313852] outline-none transition-colors focus:border-[#5849F2]'

export function AuditFilterBar({ filters, connections, onChange, statusOptions = ALL_STATUSES }: AuditFilterBarProps) {
  const hasActiveFilter = Boolean(filters.connectionId || filters.status || filters.from || filters.to)

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
      <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#7B7E8F]">
        Connection
        <select
          aria-label="Filter by connection"
          value={filters.connectionId}
          onChange={event => onChange({ ...filters, connectionId: event.target.value })}
          className={selectClass}
        >
          <option value="">All connections</option>
          {connections.map(connection => (
            <option key={connection.id} value={connection.id}>{connection.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#7B7E8F]">
        Status
        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={event => onChange({ ...filters, status: event.target.value })}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{STATUS_META[status].label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#7B7E8F]">
        From
        <input
          type="date"
          aria-label="Filter from date"
          value={filters.from}
          onChange={event => onChange({ ...filters, from: event.target.value })}
          className={selectClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#7B7E8F]">
        To
        <input
          type="date"
          aria-label="Filter to date"
          value={filters.to}
          onChange={event => onChange({ ...filters, to: event.target.value })}
          className={selectClass}
        />
      </label>

      {hasActiveFilter ? (
        <button
          type="button"
          onClick={() => onChange({ connectionId: '', status: '', from: '', to: '' })}
          className="inline-flex h-11 items-center rounded-full border border-[#C2CBD4] px-4 text-sm font-medium text-[#313852] transition-colors hover:bg-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  )
}
