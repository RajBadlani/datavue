'use client'

import { type HistoryFilters } from './use-history-filters'

type Connection = { id: string; label: string }

type HistoryFiltersProps = {
  filters: HistoryFilters
  connections: Connection[]
  onFilterChange: (key: keyof HistoryFilters, value: string | number) => void
  onExport: () => void
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'TIMEOUT', label: 'Timeout' },
]

const DAYS_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last year' },
]

export function HistoryFilters({ filters, connections, onFilterChange, onExport }: HistoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Connection filter */}
      <select
        value={filters.connectionId}
        onChange={e => onFilterChange('connectionId', e.target.value)}
        aria-label="Filter by connection"
        className="h-10 rounded-[12px] border border-[#C2CBD4] bg-white px-3 text-[14px] text-[#313852] outline-none focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
      >
        <option value="">All connections</option>
        {connections.map(c => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={e => onFilterChange('status', e.target.value)}
        aria-label="Filter by status"
        className="h-10 rounded-[12px] border border-[#C2CBD4] bg-white px-3 text-[14px] text-[#313852] outline-none focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Date range */}
      <select
        value={filters.days}
        onChange={e => onFilterChange('days', e.target.value)}
        aria-label="Filter by date range"
        className="h-10 rounded-[12px] border border-[#C2CBD4] bg-white px-3 text-[14px] text-[#313852] outline-none focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
      >
        {DAYS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Search */}
      <input
        type="text"
        value={filters.search}
        onChange={e => onFilterChange('search', e.target.value)}
        placeholder="Search queries…"
        aria-label="Search queries"
        className="h-10 w-48 rounded-[12px] border border-[#C2CBD4] bg-white px-3 text-[14px] text-[#313852] placeholder:text-[#7B7E8F] outline-none focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
      />

      {/* Export */}
      <button
        type="button"
        onClick={onExport}
        className="ml-auto h-10 rounded-full border border-[#313852] bg-transparent px-4 text-[14px] font-medium text-[#313852] transition-colors hover:bg-[#313852] hover:text-white"
      >
        Export CSV
      </button>
    </div>
  )
}
