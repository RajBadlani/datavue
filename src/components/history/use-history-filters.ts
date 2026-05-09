'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export type HistoryFilters = {
  connectionId: string
  status: string
  days: string
  search: string
  page: number
}

export function useHistoryFilters(): {
  filters: HistoryFilters
  setFilter: (key: keyof HistoryFilters, value: string | number) => void
  resetFilters: () => void
} {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: HistoryFilters = {
    connectionId: searchParams.get('connectionId') || '',
    status: searchParams.get('status') || '',
    days: searchParams.get('days') || '30',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
  }

  const setFilter = useCallback(
    (key: keyof HistoryFilters, value: string | number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === '' || value === 0) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
      // Reset page when changing filters
      if (key !== 'page') {
        params.delete('page')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  return { filters, setFilter, resetFilters }
}
