'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useHistoryFilters } from './use-history-filters'
import { HistoryFilters } from './history-filters'
import { HistoryStatsRow } from './history-stats-row'
import { HistoryList } from './history-list'
import { HistoryDetailDrawer } from './history-detail-drawer'
import { HistoryEmptyState } from './history-empty-state'

type Connection = { id: string; label: string }

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

type Stats = {
  totalQueries: number
  successRate: number
  avgExecutionMs: number
  blockedCount: number
}

type HistoryResponse = {
  items: AuditLogItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  stats: Stats
}

function HistoryViewInner({ connections }: { connections: Connection[] }) {
  const { filters, setFilter } = useHistoryFilters()
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.connectionId) params.set('connectionId', filters.connectionId)
    if (filters.status) params.set('status', filters.status)
    if (filters.days) params.set('days', filters.days)
    if (filters.search) params.set('search', filters.search)
    params.set('page', String(filters.page))

    try {
      const res = await fetch(`/api/history?${params.toString()}`)
      if (res.ok) {
        const json = await res.json() as HistoryResponse
        setData(json)
      }
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleExport() {
    const params = new URLSearchParams()
    if (filters.connectionId) params.set('connectionId', filters.connectionId)
    if (filters.status) params.set('status', filters.status)
    if (filters.days) params.set('days', filters.days)
    if (filters.search) params.set('search', filters.search)
    window.open(`/api/history/export?${params.toString()}`, '_blank')
  }

  const isEmpty = !loading && data && data.items.length === 0 && !filters.search && !filters.status && !filters.connectionId

  return (
    <div className="space-y-6">
      <HistoryFilters
        filters={filters}
        connections={connections}
        onFilterChange={setFilter}
        onExport={handleExport}
      />

      {data && !isEmpty && (
        <HistoryStatsRow stats={data.stats} />
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <span className="text-[14px] text-[#7B7E8F]">Loading history…</span>
        </div>
      )}

      {isEmpty && <HistoryEmptyState />}

      {!loading && data && data.items.length > 0 && (
        <HistoryList
          items={data.items}
          onSelect={setSelectedId}
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={p => setFilter('page', p)}
        />
      )}

      {!loading && data && data.items.length === 0 && !isEmpty && (
        <div className="py-12 text-center">
          <p className="text-[15px] text-[#7B7E8F]">No queries match your filters.</p>
        </div>
      )}

      <HistoryDetailDrawer
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}

export function HistoryView({ connections }: { connections: Connection[] }) {
  return (
    <Suspense fallback={<div className="py-12 text-center text-[14px] text-[#7B7E8F]">Loading…</div>}>
      <HistoryViewInner connections={connections} />
    </Suspense>
  )
}
