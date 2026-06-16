'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { AuditFilters } from '@/components/audit/audit-filter-bar'
import type { AuditFeedResponse, AuditLogItem } from '@/components/audit/types'

type ErrorResponse = { error?: { message?: string } }

function buildQuery(filters: AuditFilters, cursor: string | null): string {
  const params = new URLSearchParams()
  if (filters.connectionId) params.set('connectionId', filters.connectionId)
  if (filters.status) params.set('status', filters.status)
  if (filters.from) params.set('from', new Date(`${filters.from}T00:00:00`).toISOString())
  if (filters.to) params.set('to', new Date(`${filters.to}T23:59:59.999`).toISOString())
  if (cursor) params.set('cursor', cursor)
  return params.toString()
}

// Shared data layer for the Query History and Audit Logs pages. Refetches from
// scratch whenever filters change; appends on load-more. A request token guards
// against out-of-order responses when filters change mid-flight.
export function useAuditFeed(initialFilters: AuditFilters) {
  const [filters, setFilters] = useState<AuditFilters>(initialFilters)
  const [items, setItems] = useState<AuditLogItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestRef = useRef(0)

  const load = useCallback(async (activeFilters: AuditFilters, activeCursor: string | null) => {
    const token = ++requestRef.current

    if (activeCursor) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const query = buildQuery(activeFilters, activeCursor)
      const response = await fetch(`/api/history${query ? `?${query}` : ''}`, { cache: 'no-store' })
      const payload = (await response.json()) as AuditFeedResponse & ErrorResponse

      if (!response.ok) {
        throw new Error(payload.error?.message || 'Failed to load query history')
      }

      // Ignore responses from superseded requests (filters changed mid-flight).
      if (token !== requestRef.current) return

      setItems(current => (activeCursor ? [...current, ...payload.items] : payload.items))
      setCursor(payload.nextCursor)
      // Require a cursor for "has more" so the Load more button (gated on
      // hasMore) and loadMore() (gated on cursor) can never disagree.
      setHasMore(payload.hasMore && Boolean(payload.nextCursor))
    } catch (loadError) {
      if (token !== requestRef.current) return
      setError(loadError instanceof Error ? loadError.message : 'Failed to load query history')
    } finally {
      if (token === requestRef.current) {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }
  }, [])

  useEffect(() => {
    void load(filters, null)
  }, [filters, load])

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || !cursor) return
    void load(filters, cursor)
  }, [cursor, filters, hasMore, isLoadingMore, load])

  return {
    filters,
    setFilters,
    items,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  }
}
