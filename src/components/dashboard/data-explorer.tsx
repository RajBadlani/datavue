'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'

type ErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
}

export type DashboardExplorerColumn = {
  name: string
  type: string
  isPrimaryKey: boolean
  isForeignKey: boolean
}

export type DashboardExplorerForeignKey = {
  columnName: string
  referencedTable: string
  referencedColumn: string
}

export type DashboardExplorerTable = {
  id: string
  displayName: string
  tableName: string
  schemaName: string
  rowEstimateLabel: string
  columns: DashboardExplorerColumn[]
  primaryKeys: string[]
  foreignKeys: DashboardExplorerForeignKey[]
}

export type DashboardExplorerConnection = {
  id: string
  label: string
  dbType: string
  syncStatus: SyncStatus
  lastSyncedLabel: string
  tableCount: number
  tables: DashboardExplorerTable[]
}

export type DashboardExplorerPreview = {
  tableId: string
  fields: string[]
  rows: Record<string, unknown>[]
  returnedRowCount: number
  isTruncated: boolean
  maskedColumns: string[]
  limit: number
}

type DashboardDataExplorerProps = {
  connections: DashboardExplorerConnection[]
  initialConnectionId: string | null
  initialTableId: string | null
  initialPreview: DashboardExplorerPreview | null
}

type PreviewResponse = {
  preview: DashboardExplorerPreview
}

function getDbLabel(dbType: string) {
  if (dbType === 'POSTGRES') return 'PostgreSQL'
  if (dbType === 'MYSQL') return 'MySQL'
  if (dbType === 'MONGODB') return 'MongoDB'
  if (dbType === 'SQLITE') return 'SQLite'
  return dbType
}

function getSyncMeta(syncStatus: SyncStatus) {
  if (syncStatus === 'SYNCED') {
    return {
      label: 'Schema ready',
      className: 'bg-[#E8F8EC] text-[#1C6B3C] border-[#BFE4C7]',
      dotClassName: 'bg-[#1C6B3C]',
    }
  }

  if (syncStatus === 'FAILED') {
    return {
      label: 'Sync failed',
      className: 'bg-[#FFF1EF] text-[#9F2F25] border-[#F5B6B0]',
      dotClassName: 'bg-[#9F2F25]',
    }
  }

  return {
    label: 'Schema syncing',
    className: 'bg-[#EDEAFF] text-[#5849F2] border-[#D8D2FF]',
    dotClassName: 'bg-[#5849F2]',
  }
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M6.15 10.3a4.15 4.15 0 1 0 0-8.3 4.15 4.15 0 0 0 0 8.3Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="m9.2 9.2 2.3 2.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function DatabaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <ellipse cx="8" cy="4" rx="4.75" ry="2.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.25 4v4c0 1.24 2.13 2.25 4.75 2.25s4.75-1.01 4.75-2.25V4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.25 8v4c0 1.24 2.13 2.25 4.75 2.25s4.75-1.01 4.75-2.25V8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function KeyBadge() {
  return <span className="rounded-full bg-[#FFF7EB] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B35B00]">PK</span>
}

function LinkBadge() {
  return <span className="rounded-full bg-[#EDEAFF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5849F2]">FK</span>
}

function EmptyPanel({ title, description, actionLabel, actionHref }: { title: string; description: string; actionLabel?: string; actionHref?: string }) {
  return (
    <section className="rounded-[28px] border border-[#C2CBD4] bg-white p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#5849F2]">Dashboard</p>
      <h1 className="mt-4 font-display text-[32px] leading-none tracking-[-0.05em] text-[#313852]">{title}</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#7B7E8F]">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#5849F2] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4B3FE0]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  )
}

export function DashboardDataExplorer({
  connections,
  initialConnectionId,
  initialTableId,
  initialPreview,
}: DashboardDataExplorerProps) {
  const [selectedConnectionIdState, setSelectedConnectionIdState] = useState<string | null>(initialConnectionId)
  const [selectedTableIdState, setSelectedTableIdState] = useState<string | null>(initialTableId)
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<DashboardExplorerPreview | null>(initialPreview)
  const defaultConnection = connections.find(connection => connection.syncStatus === 'SYNCED' && connection.tables.length > 0) ?? connections[0] ?? null
  const selectedConnectionId = connections.some(connection => connection.id === selectedConnectionIdState)
    ? selectedConnectionIdState
    : defaultConnection?.id ?? null
  const selectedConnection = connections.find(connection => connection.id === selectedConnectionId) ?? null
  const selectedTableId = selectedConnection?.tables.some(table => table.id === selectedTableIdState)
    ? selectedTableIdState
    : selectedConnection?.tables[0]?.id ?? null
  const activeSelectionKey = selectedConnection && selectedConnection.syncStatus === 'SYNCED' && selectedTableId
    ? `${selectedConnection.id}:${selectedTableId}`
    : null
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    initialPreview ? 'ready' : activeSelectionKey ? 'loading' : 'idle',
  )
  const [previewError, setPreviewError] = useState<string | null>(null)
  const previewCacheRef = useRef<Record<string, DashboardExplorerPreview>>(initialPreview && initialConnectionId && initialTableId ? {
    [`${initialConnectionId}:${initialTableId}`]: initialPreview,
  } : {})

  const filteredTables = selectedConnection
    ? selectedConnection.tables.filter(table => {
      const term = search.trim().toLowerCase()
      if (!term) return true
      return (
        table.displayName.toLowerCase().includes(term) ||
        table.columns.some(column => column.name.toLowerCase().includes(term))
      )
    })
    : []
  const selectedTable = selectedConnection?.tables.find(table => table.id === selectedTableId) ?? null
  const activePreview = preview && preview.tableId === selectedTableId ? preview : null

  function selectConnection(connectionId: string) {
    const nextConnection = connections.find(connection => connection.id === connectionId) ?? null
    const nextTableId = nextConnection?.tables[0]?.id ?? null
    const nextSelectionKey = nextConnection && nextConnection.syncStatus === 'SYNCED' && nextTableId
      ? `${nextConnection.id}:${nextTableId}`
      : null

    setSelectedConnectionIdState(connectionId)
    setSelectedTableIdState(nextTableId)
    setPreviewError(null)

    if (!nextSelectionKey) {
      setPreview(null)
      setPreviewStatus('idle')
      return
    }

    const cachedPreview = previewCacheRef.current[nextSelectionKey]
    if (cachedPreview) {
      setPreview(cachedPreview)
      setPreviewStatus('ready')
      return
    }

    setPreview(null)
    setPreviewStatus('loading')
  }

  function selectTable(tableId: string) {
    if (!selectedConnection) {
      return
    }

    const nextSelectionKey = selectedConnection.syncStatus === 'SYNCED'
      ? `${selectedConnection.id}:${tableId}`
      : null

    setSelectedTableIdState(tableId)
    setPreviewError(null)

    if (!nextSelectionKey) {
      setPreview(null)
      setPreviewStatus('idle')
      return
    }

    const cachedPreview = previewCacheRef.current[nextSelectionKey]
    if (cachedPreview) {
      setPreview(cachedPreview)
      setPreviewStatus('ready')
      return
    }

    setPreview(null)
    setPreviewStatus('loading')
  }

  useEffect(() => {
    if (!selectedConnection || !selectedTableId || !activeSelectionKey) {
      return
    }

    if (previewCacheRef.current[activeSelectionKey]) {
      return
    }

    const controller = new AbortController()

    void fetch(`/api/connections/${selectedConnection.id}/tables/${selectedTableId}/rows?limit=50`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async response => {
        const payload = (await response.json()) as PreviewResponse & ErrorResponse
        if (!response.ok) {
          throw new Error(payload.error?.message ?? 'Could not load table preview')
        }

        previewCacheRef.current[activeSelectionKey] = payload.preview
        setPreview(payload.preview)
        setPreviewStatus('ready')
      })
      .catch(error => {
        if (controller.signal.aborted) {
          return
        }

        setPreview(null)
        setPreviewStatus('error')
        setPreviewError(error instanceof Error ? error.message : 'Could not load table preview')
      })

    return () => controller.abort()
  }, [activeSelectionKey, selectedConnection, selectedTableId])

  if (connections.length === 0) {
    return (
      <div className="px-6 py-6 sm:px-8 lg:px-10">
        <EmptyPanel
          title="Connect a database to start browsing tables"
          description="The dashboard explorer opens synced tables, schema details, and the first rows of data without asking you to write SQL first."
          actionHref="/connections"
          actionLabel="Open Connections"
        />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
      <section className="rounded-[28px] border border-[#C2CBD4] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#5849F2]">Dashboard</p>
            <h1 className="mt-3 font-display text-[32px] leading-none tracking-[-0.05em] text-[#313852]">Browse live table data</h1>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#7B7E8F]">
              Pick a synced connection, inspect its tables, and preview live rows in a read-only explorer built from your saved schema metadata.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[12px] text-[#5F6475]">
            {['Read-only previews', 'Schema-aware table list', 'Sensitive fields masked when detected'].map(item => (
              <span key={item} className="rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="flex min-w-max gap-3 pb-1">
            {connections.map(connection => {
              const syncMeta = getSyncMeta(connection.syncStatus)
              const isActive = connection.id === selectedConnectionId

              return (
                <button
                  key={connection.id}
                  type="button"
                  onClick={() => selectConnection(connection.id)}
                  className={`w-[260px] rounded-[24px] border p-4 text-left transition-colors ${isActive
                    ? 'border-[#5849F2] bg-[#EDEAFF]'
                    : 'border-[#E5E0D4] bg-[#FCFAF5] hover:border-[#C2CBD4] hover:bg-white'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-[#313852]">
                      <DatabaseIcon />
                      <span className="text-sm font-semibold">{connection.label}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${syncMeta.className}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${syncMeta.dotClassName}`} aria-hidden="true" />
                      {syncMeta.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#5F6475]">{getDbLabel(connection.dbType)}</p>
                  <div className="mt-4 flex items-center justify-between text-[12px] text-[#7B7E8F]">
                    <span>{connection.tableCount} tables</span>
                    <span>{connection.lastSyncedLabel}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-[#C2CBD4] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7B7E8F]">Tables</p>
              <p className="mt-1 text-sm text-[#5F6475]">
                {selectedConnection ? `${selectedConnection.tableCount} synced table${selectedConnection.tableCount !== 1 ? 's' : ''}` : 'No connection selected'}
              </p>
            </div>
            {selectedConnection ? (
              <span className="rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-1 text-[11px] font-medium text-[#5F6475]">
                {getDbLabel(selectedConnection.dbType)}
              </span>
            ) : null}
          </div>

          <label className="mt-4 flex items-center gap-2 rounded-2xl border border-[#C2CBD4] bg-[#FCFAF5] px-3 py-3 text-[#7B7E8F] focus-within:border-[#5849F2] focus-within:text-[#5849F2]">
            <SearchIcon />
            <span className="sr-only">Search tables</span>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search tables or columns"
              className="w-full bg-transparent text-sm text-[#313852] outline-none placeholder:text-[#7B7E8F]"
            />
          </label>

          <div className="mt-4 max-h-[640px] space-y-2 overflow-y-auto pr-1">
            {selectedConnection?.syncStatus !== 'SYNCED' ? (
              <div className="rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-4 text-sm leading-7 text-[#7B7E8F]">
                Table browsing becomes available after the saved schema finishes syncing.
              </div>
            ) : null}

            {selectedConnection?.syncStatus === 'SYNCED' && filteredTables.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-4 text-sm leading-7 text-[#7B7E8F]">
                {selectedConnection.tables.length === 0
                  ? 'No tables were found in the synced schema for this connection.'
                  : 'No tables matched your current search.'}
              </div>
            ) : null}

            {selectedConnection?.syncStatus === 'SYNCED'
              ? filteredTables.map(table => {
                const isActive = table.id === selectedTableId

                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => selectTable(table.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition-colors ${isActive
                      ? 'border-[#5849F2] bg-[#EDEAFF]'
                      : 'border-[#E5E0D4] bg-[#FCFAF5] hover:border-[#C2CBD4] hover:bg-white'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[13px] text-[#313852]">{table.displayName}</p>
                        <p className="mt-1 text-[11px] text-[#7B7E8F]">{table.rowEstimateLabel}</p>
                      </div>
                      <span className="rounded-full border border-[#E5E0D4] bg-white px-2.5 py-1 text-[11px] text-[#5F6475]">
                        {table.columns.length} cols
                      </span>
                    </div>
                  </button>
                )
              })
              : null}
          </div>
        </aside>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[28px] border border-[#C2CBD4] bg-white p-4 sm:p-5">
            {selectedConnection ? (
              <>
                <div className="flex flex-col gap-4 border-b border-[#E5E0D4] pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7B7E8F]">Table preview</p>
                    <h2 className="mt-2 font-mono text-[20px] text-[#313852]">
                      {selectedTable?.displayName ?? 'Select a table'}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-[#7B7E8F]">
                      {selectedTable
                        ? `Showing up to 50 live rows from ${selectedConnection.label}.`
                        : 'Choose a table from the left rail to load a preview.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[12px] text-[#5F6475]">
                    <span className="rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-1.5">{getDbLabel(selectedConnection.dbType)}</span>
                    <span className="rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-1.5">{selectedConnection.lastSyncedLabel}</span>
                    {activePreview?.maskedColumns.length ? (
                      <span className="rounded-full border border-[#D8D2FF] bg-[#EDEAFF] px-3 py-1.5 text-[#5849F2]">
                        Masked: {activePreview.maskedColumns.join(', ')}
                      </span>
                    ) : null}
                  </div>
                </div>

                {selectedConnection.syncStatus !== 'SYNCED' ? (
                  <div className="mt-4 rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-5 text-sm leading-7 text-[#7B7E8F]">
                    DatavueX only opens live table previews after schema sync completes. Return to Connections if this source needs another sync.
                  </div>
                ) : null}

                {selectedConnection.syncStatus === 'SYNCED' && !selectedTable ? (
                  <div className="mt-4 rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-5 text-sm leading-7 text-[#7B7E8F]">
                    Select a table from the left rail to preview its rows.
                  </div>
                ) : null}

                {selectedConnection.syncStatus === 'SYNCED' && selectedTable && previewStatus === 'loading' ? (
                  <div className="mt-4 rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-5 text-sm leading-7 text-[#7B7E8F]">
                    Loading live rows for <span className="font-mono text-[#313852]">{selectedTable.displayName}</span>...
                  </div>
                ) : null}

                {selectedConnection.syncStatus === 'SYNCED' && selectedTable && previewStatus === 'error' ? (
                  <div className="mt-4 rounded-2xl border border-[#F5B6B0] bg-[#FFF1EF] p-5 text-sm leading-7 text-[#9F2F25]">
                    {previewError ?? 'Could not load table preview.'}
                  </div>
                ) : null}

                {selectedConnection.syncStatus === 'SYNCED' && selectedTable && previewStatus === 'ready' && activePreview ? (
                  <>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-[#5F6475]">
                      <span className="rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-1.5">
                        {activePreview.returnedRowCount} row{activePreview.returnedRowCount !== 1 ? 's' : ''} loaded
                      </span>
                      <span className="rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-1.5">
                        {activePreview.fields.length} columns visible
                      </span>
                      {activePreview.isTruncated ? (
                        <span className="rounded-full border border-[#D8D2FF] bg-[#EDEAFF] px-3 py-1.5 text-[#5849F2]">
                          Preview capped at {activePreview.limit} rows
                        </span>
                      ) : null}
                    </div>

                    {activePreview.rows.length === 0 ? (
                      <div className="mt-4 rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-5 text-sm leading-7 text-[#7B7E8F]">
                        This table is currently empty.
                      </div>
                    ) : (
                      <div className="mt-4 overflow-hidden rounded-[24px] border border-[#E5E0D4]">
                        <div className="max-h-[620px] overflow-auto">
                          <table className="min-w-full border-separate border-spacing-0 text-left text-[13px]">
                            <thead className="sticky top-0 z-10 bg-[#FCFAF5]">
                              <tr>
                                <th className="border-b border-[#E5E0D4] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7B7E8F]">#</th>
                                {activePreview.fields.map(field => (
                                  <th
                                    key={field}
                                    className="border-b border-[#E5E0D4] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7B7E8F]"
                                  >
                                    {field}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {activePreview.rows.map((row, rowIndex) => (
                                <tr key={`${rowIndex}-${selectedTable.id}`} className="bg-white even:bg-[#FFFDFA]">
                                  <td className="border-b border-[#F0EBE1] px-4 py-3 text-[12px] text-[#7B7E8F]">{rowIndex + 1}</td>
                                  {activePreview.fields.map(field => {
                                    const formattedValue = formatCellValue(row[field])
                                    return (
                                      <td key={field} className="border-b border-[#F0EBE1] px-4 py-3 align-top text-[#313852]">
                                        <div className="max-w-[32ch] overflow-hidden text-ellipsis whitespace-nowrap" title={formattedValue}>
                                          {formattedValue}
                                        </div>
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </>
            ) : (
              <div className="rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-5 text-sm leading-7 text-[#7B7E8F]">
                Select a connection to start browsing tables.
              </div>
            )}
          </div>

          <aside className="rounded-[28px] border border-[#C2CBD4] bg-white p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7B7E8F]">Schema detail</p>

            {selectedTable ? (
              <>
                <h2 className="mt-3 font-mono text-[18px] text-[#313852]">{selectedTable.displayName}</h2>
                <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-[#5F6475]">
                  <span className="rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-1.5">{selectedTable.rowEstimateLabel}</span>
                  <span className="rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-1.5">{selectedTable.columns.length} columns</span>
                </div>

                <div className="mt-5 space-y-2">
                  {selectedTable.columns.map(column => (
                    <div key={column.name} className="rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-[13px] text-[#313852]">{column.name}</p>
                          <p className="mt-1 text-[12px] text-[#7B7E8F]">{column.type}</p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {column.isPrimaryKey ? <KeyBadge /> : null}
                          {column.isForeignKey ? <LinkBadge /> : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTable.foreignKeys.length > 0 ? (
                  <div className="mt-5 rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7B7E8F]">Relationships</p>
                    <div className="mt-3 space-y-2 text-sm text-[#313852]">
                      {selectedTable.foreignKeys.map(relationship => (
                        <div key={`${relationship.columnName}-${relationship.referencedTable}-${relationship.referencedColumn}`}>
                          <span className="font-mono">{relationship.columnName}</span>
                          {' -> '}
                          <span className="font-mono">{relationship.referencedTable}.{relationship.referencedColumn}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-4 text-sm leading-7 text-[#7B7E8F]">
                Column definitions, keys, and relationships appear here when you select a table.
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  )
}
