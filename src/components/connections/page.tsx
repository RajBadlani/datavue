'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { connectionNotifications, dbTypeOptions, sslModeOptions } from '@/components/connections/constants'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  ConnectionDbIcon,
  KeyIcon,
  LinkIcon,
  LockIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  SpinnerIcon,
  TrashIcon,
} from '@/components/connections/icons'
import type { ConnectionRecord, ConnectionToast, DbType } from '@/components/connections/types'
import {
  deriveConnectionName,
  formatCreatedAt,
  formatLastQueried,
  fromApiDbType,
  getConnectionStatusMeta,
  getDbDefaultPort,
  getDbLabel,
  maskUsername,
  parseConnectionString,
  sortConnections,
  statusFromSyncStatus,
  toApiDbType,
} from '@/components/connections/utils'
import { NumberTicker } from '@/components/landing/ui'

type ConnectionFormState = {
  dbType: DbType
  connectionString: string
  mode: 'connection-string' | 'manual'
  host: string
  port: string
  dbName: string
  username: string
  password: string
  sslMode: string
  connectionName: string
}

type ApiConnectionRecord = {
  id: string
  label: string
  dbType: string
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'
  lastSyncedAt: string | null
  createdAt: string
  host?: string
  port?: number
  database?: string
  user?: string
  ssl?: boolean
  tableCount?: number
  schema?: Array<{
    id: string
    tableName: string
    schemaName: string
    columns: Array<{ name: string; type?: string; dataType?: string }>
    primaryKeys: string[]
    foreignKeys: Array<{ columnName?: string; column?: string }>
    rowEstimate: number | string
  }>
}

type ConnectionsResponse = {
  connections: ApiConnectionRecord[]
}

type TestConnectionResponse = {
  success: boolean
  latencyMs: number
  message: string
}

type ErrorResponse = {
  error?: {
    code?: string
    message?: string
  }
}

const defaultDbType = dbTypeOptions[0].value

const firstConnectionSteps = [
  {
    title: 'Bring a read-only credential',
    description: 'Use a restricted user so Datavue can inspect schema and answer questions without write access.',
  },
  {
    title: 'Test before saving',
    description: 'The connection check verifies host, SSL, database, and credentials before anything is stored.',
  },
  {
    title: 'Review the schema sync',
    description: 'Tables, columns, status, and later query history will appear here when sync completes.',
  },
]

const connectionPrepItems = ['Connection string or host details', 'Read-only username and password', 'Database name and SSL mode']

const connectionTrustItems = ['Encrypted at rest', 'Read-only recommended', 'Test required before save']

function createDefaultForm(): ConnectionFormState {
  return {
    dbType: defaultDbType,
    connectionString: '',
    mode: 'connection-string',
    host: '',
    port: getDbDefaultPort(defaultDbType),
    dbName: '',
    username: '',
    password: '',
    sslMode: 'Require',
    connectionName: '',
  }
}

function resolveConnectionDetails(form: ConnectionFormState) {
  if (form.mode === 'connection-string') {
    const parsed = parseConnectionString(form.connectionString, form.dbType)
    if (!parsed) {
      return null
    }

    return {
      ...form,
      ...parsed,
      connectionName: form.connectionName || deriveConnectionName(parsed.dbName, parsed.host),
    }
  }

  return form
}

function getSafeHostDisplay(connection: Pick<ConnectionRecord, 'dbType' | 'host' | 'dbName'>) {
  if (connection.host === 'Credentials stored securely') {
    return connection.host
  }

  const engine = getDbLabel(connection.dbType)
  const database = connection.dbName && connection.dbName !== 'Unknown' ? connection.dbName : 'database'
  return `${engine} connection to ${database}`
}

function createToastId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function ConnectionsPage() {
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const newDialogRef = useRef<HTMLDivElement | null>(null)
  const upgradeDialogRef = useRef<HTMLDivElement | null>(null)
  const deleteDialogRef = useRef<HTMLDivElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showHealthBanner, setShowHealthBanner] = useState(true)
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [form, setForm] = useState<ConnectionFormState>(createDefaultForm())
  const [testState, setTestState] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAffectedOnly, setShowAffectedOnly] = useState(false)
  const [overviewTesting, setOverviewTesting] = useState(false)
  const [overviewTab, setOverviewTab] = useState<'overview' | 'schema' | 'history'>('overview')
  const [openTables, setOpenTables] = useState<Record<string, boolean>>({})
  const [toasts, setToasts] = useState<ConnectionToast[]>([])
  const [isLoadingConnections, setIsLoadingConnections] = useState(true)
  const [isRefreshingConnections, setIsRefreshingConnections] = useState(false)
  const [deletingConnectionId, setDeletingConnectionId] = useState<string | null>(null)
  const syncStatusRef = useRef<Record<string, ConnectionRecord['status']>>({})

  const starterConnectionLimit = 3
  const isStarterLimitReached = connections.length >= starterConnectionLimit

  const filteredConnections = useMemo(() => {
    let next = [...connections]
    if (showAffectedOnly) {
      next = next.filter(connection => connection.status === 'unreachable')
    }
    if (typeFilter !== 'all') {
      next = next.filter(connection => connection.dbType === typeFilter)
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      next = next.filter(connection => connection.name.toLowerCase().includes(term) || connection.host.toLowerCase().includes(term))
    }
    return sortConnections(next, sortBy)
  }, [connections, search, showAffectedOnly, sortBy, typeFilter])

  const mapApiConnectionToRecord = useCallback((connection: ApiConnectionRecord): ConnectionRecord => {
    const dbType = fromApiDbType(connection.dbType)

    return {
      id: connection.id,
      name: connection.label,
      host: connection.host ? `${dbType === 'mongodb' ? 'mongodb' : dbType === 'mysql' ? 'mysql' : 'postgres'}://${connection.host}${connection.port ? `:${connection.port}` : ''}/${connection.database ?? ''}` : 'Credentials stored securely',
      port: String(connection.port ?? getDbDefaultPort(dbType)),
      dbName: connection.database ?? 'Unknown',
      username: connection.user ?? 'hidden',
      dbType,
      status: statusFromSyncStatus(connection.syncStatus),
      syncStatus: connection.syncStatus,
      version: getDbLabel(dbType),
      tableCount: connection.tableCount ?? connection.schema?.length ?? 0,
      lastQueried: formatLastQueried(connection.lastSyncedAt),
      createdAt: formatCreatedAt(connection.createdAt),
      totalQueries: 0,
      sslMode: connection.ssl ? 'Require' : 'Disable',
      schema: (connection.schema ?? []).map(table => ({
        name: table.schemaName && table.schemaName !== 'public' ? `${table.schemaName}.${table.tableName}` : table.tableName,
        rowCount: typeof table.rowEstimate === 'number' ? `${table.rowEstimate.toLocaleString()} rows` : `${table.rowEstimate} rows`,
        columns: (table.columns ?? []).map(column => ({
          name: column.name,
          type: column.type ?? column.dataType ?? 'UNKNOWN',
          isPrimaryKey: table.primaryKeys.includes(column.name),
          isForeignKey: (table.foreignKeys ?? []).some(foreignKey => (foreignKey.columnName ?? foreignKey.column) === column.name),
        })),
      })),
      history: [],
    }
  }, [])

  const refreshConnections = useCallback(async (options?: { silent?: boolean }) => {
    if (options?.silent) {
      setIsRefreshingConnections(true)
    } else {
      setIsLoadingConnections(true)
    }

    try {
      const response = await fetch('/api/connections', { cache: 'no-store' })
      const payload = (await response.json()) as ConnectionsResponse & ErrorResponse

      if (!response.ok) {
        throw new Error(payload.error?.message || 'Failed to load connections')
      }

      const nextConnections = payload.connections.map(mapApiConnectionToRecord)

      nextConnections.forEach(connection => {
        const previousStatus = syncStatusRef.current[connection.id]
        if (previousStatus === 'syncing' && connection.status === 'connected') {
          enqueueToast({
            tone: 'success',
            title: 'Database ready for chat and analysis',
            description: `${connection.name} finished syncing and is ready inside Datavue.`,
            actionLabel: 'Open Chat',
            actionConnectionId: connection.id,
          })
        }

        syncStatusRef.current[connection.id] = connection.status
      })

      setConnections(nextConnections)
      setSelectedId(current => current && nextConnections.some(connection => connection.id === current) ? current : nextConnections[0]?.id ?? null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load connections'
      enqueueToast({ tone: 'error', title: 'Could not load connections', description: message })
    } finally {
      setIsLoadingConnections(false)
      setIsRefreshingConnections(false)
    }
  }, [mapApiConnectionToRecord])

  useEffect(() => {
    void refreshConnections()
  }, [refreshConnections])

  useEffect(() => {
    const hasSyncingConnections = connections.some(connection => connection.status === 'syncing')
    if (!hasSyncingConnections) return

    const interval = window.setInterval(() => {
      void refreshConnections({ silent: true })
    }, 4000)

    return () => window.clearInterval(interval)
  }, [connections, refreshConnections])

  useEffect(() => {
    const activeDialog = newDialogOpen || upgradeDialogOpen || deleteDialogId

    if (activeDialog && !previousFocusRef.current) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    }

    if (!activeDialog && previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [deleteDialogId, newDialogOpen, upgradeDialogOpen])

  useEffect(() => {
    if (newDialogOpen) {
      newDialogRef.current?.focus()
    }
  }, [newDialogOpen])

  useEffect(() => {
    if (upgradeDialogOpen) {
      upgradeDialogRef.current?.focus()
    }
  }, [upgradeDialogOpen])

  useEffect(() => {
    if (deleteDialogId) {
      deleteDialogRef.current?.focus()
    }
  }, [deleteDialogId])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditable = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable
      const activeDialog = newDialogOpen ? newDialogRef.current : upgradeDialogOpen ? upgradeDialogRef.current : deleteDialogId ? deleteDialogRef.current : null

      if (activeDialog && event.key === 'Tab') {
        const focusableElements = Array.from(
          activeDialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')
        ).filter(element => !element.hasAttribute('disabled') && element.offsetParent !== null)

        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]

          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }

      if (!isEditable && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        if (isStarterLimitReached) {
          setUpgradeDialogOpen(true)
        } else {
          setNewDialogOpen(true)
        }
      }

      if (!isEditable && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        searchRef.current?.focus()
      }

      if (event.key === 'Escape') {
        setHoveredId(null)
        setSelectedId(null)
        setNewDialogOpen(false)
        setUpgradeDialogOpen(false)
        setDeleteDialogId(null)
      }

      if (document.activeElement === gridRef.current && ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
        const focusableConnections = filteredConnections
        if (focusableConnections.length === 0) return

        const currentIndex = Math.max(0, focusableConnections.findIndex(connection => connection.id === (selectedId ?? focusableConnections[0].id)))
        let nextIndex = currentIndex

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = Math.min(focusableConnections.length - 1, currentIndex + 1)
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = Math.max(0, currentIndex - 1)

        if (event.key === 'Enter') {
          const activeConnection = focusableConnections[currentIndex]
          router.push(`/chat/${activeConnection.id}`)
          return
        }

        event.preventDefault()
        setSelectedId(focusableConnections[nextIndex].id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [deleteDialogId, filteredConnections, isStarterLimitReached, newDialogOpen, router, selectedId, upgradeDialogOpen])

  useEffect(() => {
    if (!toasts.length) return
    const timeout = window.setTimeout(() => {
      setToasts(current => current.slice(1))
    }, 3600)

    return () => window.clearTimeout(timeout)
  }, [toasts])

  const unreachableConnections = connections.filter(connection => connection.status === 'unreachable')
  const activeConnection = connections.find(connection => connection.id === (selectedId ?? hoveredId)) ?? null
  const deleteTarget = connections.find(connection => connection.id === deleteDialogId) ?? null

  const hasNoConnections = connections.length === 0
  const allConnectionsUnreachable = connections.length > 0 && connections.every(connection => connection.status === 'unreachable')

  function enqueueToast(toast: Omit<ConnectionToast, 'id'>) {
    setToasts(current => [...current, { id: createToastId(), ...toast }])
  }

  function openNewConnectionDialog(prefill?: Partial<ConnectionFormState>) {
    const nextDbType = prefill?.dbType ?? defaultDbType
    setForm({ ...createDefaultForm(), ...prefill, dbType: nextDbType, port: prefill?.port ?? getDbDefaultPort(nextDbType) })
    setTestState(null)
    setNewDialogOpen(true)
  }

  function handleDbTypeSelect(dbType: DbType) {
    setForm(current => ({
      ...current,
      dbType,
      port: getDbDefaultPort(dbType),
      connectionName: current.connectionName || deriveConnectionName(current.dbName, current.host),
    }))
  }

  async function handleTestConnection() {
    setIsTesting(true)
    setTestState(null)

    const resolvedForm = resolveConnectionDetails(form)
    if (!resolvedForm) {
      setIsTesting(false)
      setTestState({ tone: 'error', message: 'Unable to parse connection string. Check the URL format and try again.' })
      return
    }

    if (!resolvedForm.connectionName.trim()) {
      setIsTesting(false)
      setTestState({ tone: 'error', message: 'Connection name is required before testing.' })
      return
    }

    if (!resolvedForm.host.trim() || !resolvedForm.port.trim() || !resolvedForm.dbName.trim() || !resolvedForm.username.trim()) {
      setIsTesting(false)
      setTestState({ tone: 'error', message: 'Complete the connection details before testing.' })
      return
    }

    setForm(current => ({
      ...current,
      host: resolvedForm.host,
      port: resolvedForm.port,
      dbName: resolvedForm.dbName,
      username: resolvedForm.username,
      password: resolvedForm.password,
      sslMode: resolvedForm.sslMode,
      connectionName: resolvedForm.connectionName,
    }))

    try {
      const response = await fetch('/api/connections/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dbType: toApiDbType(resolvedForm.dbType),
          host: resolvedForm.host,
          port: Number(resolvedForm.port),
          user: resolvedForm.username,
          password: resolvedForm.password,
          database: resolvedForm.dbName,
          ssl: resolvedForm.sslMode !== 'Disable',
        }),
      })

      const payload = (await response.json()) as TestConnectionResponse & ErrorResponse

      if (!response.ok) {
        throw new Error(payload.error?.message || 'Connection test failed')
      }

      setTestState({
        tone: 'success',
        message: `Connection successful: ${getDbLabel(resolvedForm.dbType)} responded in ${payload.latencyMs}ms`,
      })
      enqueueToast({
        tone: 'success',
        title: 'Connection test passed',
        description: payload.message,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection test failed'
      setTestState({ tone: 'error', message })
      enqueueToast({ tone: 'error', title: 'Connection test failed', description: message })
    } finally {
      setIsTesting(false)
    }
  }

  async function handleSaveConnection() {
    if (!testState || testState.tone !== 'success') return

    const resolvedForm = resolveConnectionDetails(form)
    if (!resolvedForm) {
      setTestState({ tone: 'error', message: 'Unable to parse connection string. Check the URL format and try again.' })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: resolvedForm.connectionName || deriveConnectionName(resolvedForm.dbName, resolvedForm.host),
          dbType: toApiDbType(resolvedForm.dbType),
          host: resolvedForm.host,
          port: Number(resolvedForm.port),
          user: resolvedForm.username,
          password: resolvedForm.password,
          database: resolvedForm.dbName,
          ssl: resolvedForm.sslMode !== 'Disable',
        }),
      })

      const payload = (await response.json()) as {
        id: string
        label: string
        dbType: string
        syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'
        createdAt: string
      } & ErrorResponse

      if (!response.ok) {
        throw new Error(payload.error?.message || 'Failed to save connection')
      }

      const optimisticConnection: ConnectionRecord = {
        id: payload.id,
        name: payload.label,
        host: `${resolvedForm.dbType === 'mongodb' ? 'mongodb' : resolvedForm.dbType === 'mysql' ? 'mysql' : 'postgres'}://${resolvedForm.host}:${resolvedForm.port}/${resolvedForm.dbName}`,
        port: resolvedForm.port,
        dbName: resolvedForm.dbName,
        username: resolvedForm.username,
        dbType: resolvedForm.dbType,
        status: statusFromSyncStatus(payload.syncStatus),
        syncStatus: payload.syncStatus,
        version: getDbLabel(resolvedForm.dbType),
        tableCount: 0,
        lastQueried: 'Never',
        createdAt: formatCreatedAt(payload.createdAt),
        totalQueries: 0,
        sslMode: resolvedForm.sslMode,
        schema: [],
        history: [],
      }

      syncStatusRef.current[optimisticConnection.id] = optimisticConnection.status
      setConnections(current => [optimisticConnection, ...current])
      setSelectedId(optimisticConnection.id)
      setHoveredId(null)
      setNewDialogOpen(false)
      enqueueToast({
        tone: 'info',
        title: 'Connection saved',
        description: `${optimisticConnection.name} is syncing metadata for chat and analysis.`,
      })
      void refreshConnections({ silent: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save connection'
      enqueueToast({ tone: 'error', title: 'Save failed', description: message })
    } finally {
      setIsSaving(false)
    }
  }

  async function runOverviewTest(connection: ConnectionRecord) {
    setOverviewTesting(true)
    await new Promise(resolve => window.setTimeout(resolve, 900))

    if (connection.status === 'unreachable') {
      enqueueToast({ tone: 'error', title: 'Connection test failed', description: connection.simulatedError ?? 'dial tcp connection refused' })
    } else {
      enqueueToast({ tone: 'success', title: 'Connection healthy', description: `${connection.name} responded successfully in 482ms.` })
    }

    setOverviewTesting(false)
  }

  async function handleDeleteConnection() {
    const target = deleteTarget
    if (!target || deleteConfirmation !== target.name) return

    setDeletingConnectionId(target.id)

    try {
      const response = await fetch(`/api/connections/${encodeURIComponent(target.id)}`, {
        method: 'DELETE',
      })
      const payload = (await response.json()) as ErrorResponse

      if (!response.ok) {
        throw new Error(payload.error?.message || 'Failed to delete connection')
      }

      delete syncStatusRef.current[target.id]
      setConnections(current => current.filter(connection => connection.id !== target.id))
      setSelectedId(current => (current === target.id ? null : current))
      setHoveredId(current => (current === target.id ? null : current))
      setOpenTables(current => Object.fromEntries(Object.entries(current).filter(([key]) => !key.startsWith(`${target.id}-`))))
      setDeleteDialogId(null)
      setDeleteConfirmation('')
      enqueueToast({ tone: 'info', title: 'Connection deleted', description: `${target.name} and its related chat, audit, and schema metadata were removed.` })
      void refreshConnections({ silent: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete connection'
      enqueueToast({ tone: 'error', title: 'Delete failed', description: message })
    } finally {
      setDeletingConnectionId(null)
    }
  }

  return (
    <div className="px-6 py-6 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-[28px] leading-none tracking-[-0.05em] text-[#313852]">Your Connections</h1>
            <p className="mt-2 text-[13px] text-[#7B7E8F]">Select a connection to start querying or create a new one.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {isRefreshingConnections ? <span className="text-xs text-[#7B7E8F]">Refreshing statuses...</span> : null}
              <button
                type="button"
              disabled={isStarterLimitReached}
              onClick={() => (isStarterLimitReached ? setUpgradeDialogOpen(true) : openNewConnectionDialog())}
              title={isStarterLimitReached ? 'Upgrade to Pro for unlimited connections.' : undefined}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                isStarterLimitReached
                  ? 'cursor-not-allowed bg-[#A79EFA] text-[#FCFAF5]'
                  : 'cursor-pointer bg-[#5849F2] text-[#FCFAF5] hover:bg-[#4338CA]'
              }`}
            >
              <PlusIcon />
              New Connection
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <span className="sr-only">Search connections</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7B7E8F]">
              <SearchIcon />
            </span>
            <input
              ref={searchRef}
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search connections"
              className="h-11 w-full rounded-2xl border border-[#C2CBD4] bg-white pl-10 pr-4 text-sm text-[#313852] outline-none transition-colors placeholder:text-[#8B8FA0] focus:border-[#5849F2]"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select aria-label="Filter by database type" value={typeFilter} onChange={event => setTypeFilter(event.target.value)} className="h-11 rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm text-[#313852] outline-none focus:border-[#5849F2]">
              <option value="all">All DB Types</option>
              {dbTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select aria-label="Sort connections" value={sortBy} onChange={event => setSortBy(event.target.value)} className="h-11 rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm text-[#313852] outline-none focus:border-[#5849F2]">
              <option value="recent">Last queried</option>
              <option value="name">Name A-Z</option>
              <option value="created">Date created</option>
            </select>
          </div>
        </div>

        {showHealthBanner && unreachableConnections.length > 0 ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-[#F0C4C4] bg-[#FEF3F2] px-4 py-3 text-sm text-[#7A271A] sm:flex-row sm:items-center sm:justify-between">
            <div>
              {unreachableConnections.length} connection{unreachableConnections.length > 1 ? 's are' : ' is'} unreachable. Check your database credentials or network configuration.
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowAffectedOnly(true)} className="text-sm font-medium text-[#5849F2] transition-colors hover:text-[#4338CA]">
                View affected
              </button>
              <button type="button" onClick={() => setShowHealthBanner(false)} className="rounded-full border border-[#F0C4C4] p-1.5 text-[#7A271A]">
                <CloseIcon />
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.72fr)]">
          <div className="space-y-4">
            {isLoadingConnections ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="min-h-40 animate-pulse rounded-[12px] border border-[#E5E0D4] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-[#F7F4EB]" />
                        <div className="space-y-2">
                          <div className="h-4 w-36 rounded-full bg-[#F7F4EB]" />
                          <div className="h-3 w-48 rounded-full bg-[#F7F4EB]" />
                        </div>
                      </div>
                      <div className="h-4 w-20 rounded-full bg-[#F7F4EB]" />
                    </div>
                    <div className="mt-5 flex gap-2">
                      <div className="h-7 w-24 rounded-full bg-[#F7F4EB]" />
                      <div className="h-7 w-20 rounded-full bg-[#F7F4EB]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hasNoConnections ? (
              <div className="rounded-[24px] border border-[#E5E0D4] bg-[#F8F5EE] p-5 animate-[fade-in_400ms_ease] sm:p-7">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B7E8F]">
                    <LockIcon />
                    First setup
                  </div>
                  <h2 className="mt-5 font-display text-[22px] leading-none tracking-[-0.04em] text-[#313852]">Connect one database to unlock chat.</h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#7B7E8F]">Start with a read-only credential. Datavue tests the connection, stores credentials encrypted, then syncs schema so questions can be checked against real tables.</p>
                </div>

                <div className="mt-6 grid gap-3 lg:grid-cols-3">
                  {firstConnectionSteps.map((step, index) => (
                    <div key={step.title} className="rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDEAFF] text-xs font-semibold text-[#5849F2]">
                        {index + 1}
                      </div>
                      <p className="mt-4 text-sm font-semibold text-[#313852]">{step.title}</p>
                      <p className="mt-2 text-[13px] leading-6 text-[#7B7E8F]">{step.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#C2CBD4] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#313852]">Ready when you have these details</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {connectionPrepItems.map(item => (
                        <span key={item} className="rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-1.5 text-[12px] text-[#5F6475]">{item}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openNewConnectionDialog()}
                    className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#5849F2] px-5 text-sm font-semibold text-[#FCFAF5] transition-colors hover:bg-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <PlusIcon />
                    Start first connection
                  </button>
                </div>
              </div>
            ) : allConnectionsUnreachable && !showAffectedOnly && !search ? (
              <div className="rounded-[24px] border border-[#E5E0D4] bg-white p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF3F2] text-[#DC3545]">
                  <CloseIcon />
                </div>
                <h2 className="mt-5 font-display text-[18px] text-[#313852]">Your connections exist, but none are reachable right now.</h2>
                <p className="mt-2 text-sm text-[#7B7E8F]">Check network access, firewall settings, or stored credentials to restore database access.</p>
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="rounded-[24px] border border-[#E5E0D4] bg-white p-6 text-sm text-[#7B7E8F]">
                No connections match &quot;{search}&quot;.{` `}
                <button type="button" onClick={() => setSearch('')} className="text-[#5849F2] transition-colors hover:text-[#4338CA]">Clear search</button>
              </div>
            ) : (
               <div ref={gridRef} tabIndex={0} className="grid gap-4 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EB] md:grid-cols-2" role="grid" aria-label="Database connections">
                {filteredConnections.map(connection => {
                  const selected = connection.id === selectedId
                  const status = getConnectionStatusMeta(connection.status)
                  return (
                    <article
                      key={connection.id}
                      role="gridcell"
                      tabIndex={0}
                      aria-selected={selected}
                      aria-label={`${connection.name}, ${status.label}, ${getSafeHostDisplay(connection)}`}
                      onClick={() => setSelectedId(connection.id)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedId(connection.id)
                        }
                      }}
                      onMouseEnter={() => setHoveredId(connection.id)}
                      onMouseLeave={() => setHoveredId(current => (current === connection.id ? null : current))}
                      className={`relative min-h-40 cursor-pointer rounded-[12px] bg-white p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EB] ${
                        selected
                          ? 'border-2 border-[#5849F2] bg-[#FAF8FF] shadow-[0_18px_60px_rgba(88,73,242,0.12)]'
                          : 'border border-[#C2CBD4] hover:border-[#5849F2] hover:shadow-[0_18px_50px_rgba(49,56,82,0.06)]'
                      } ${search && !(connection.name.toLowerCase().includes(search.toLowerCase()) || connection.host.toLowerCase().includes(search.toLowerCase())) ? 'opacity-40' : 'opacity-100'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F4EB] text-[#313852]">
                            <ConnectionDbIcon dbType={connection.dbType} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[15px] font-medium text-[#313852]">{connection.name}</p>
                            <p className="truncate text-[12px] text-[#7B7E8F]" title="Connection host is hidden for security">{getSafeHostDisplay(connection)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#7B7E8F]">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.dot }} />
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {[connection.version, `${connection.tableCount} tables`, `Last queried ${connection.lastQueried}`].map(item => (
                          <span key={item} className="rounded-full border border-[#E5E0D4] bg-[#FCFAF5] px-2.5 py-1 text-[11px] text-[#5F6475]">
                            {item}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={event => {
                            event.stopPropagation()
                            router.push(`/chat/${connection.id}`)
                          }}
                          className="inline-flex min-h-11 items-center text-[13px] font-medium text-[#5849F2] transition-colors hover:text-[#4338CA]"
                        >
                          Open Chat
                        </button>

                        <button
                          type="button"
                          onClick={event => {
                            event.stopPropagation()
                            setDeleteDialogId(connection.id)
                          }}
                          disabled={deletingConnectionId === connection.id}
                          className={`rounded-full border border-[#F0C4C4] p-2 text-[#B42318] transition-colors hover:bg-[#FEF3F2] ${deletingConnectionId === connection.id ? 'cursor-not-allowed opacity-60' : ''}`}
                          aria-label={`Delete ${connection.name}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <aside className={`rounded-[20px] border border-[#C2CBD4] bg-white p-5 transition-all duration-300 ${activeConnection ? 'opacity-100 translate-x-0' : 'opacity-100'}`}>
            {activeConnection ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F4EB] text-[#313852]">
                    <ConnectionDbIcon dbType={activeConnection.dbType} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[20px] leading-none tracking-[-0.04em] text-[#313852]">{activeConnection.name}</h2>
                    <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium ${getConnectionStatusMeta(activeConnection.status).badge}`}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getConnectionStatusMeta(activeConnection.status).dot }} />
                      {getConnectionStatusMeta(activeConnection.status).label}
                    </div>
                  </div>
                </div>

                <button type="button" onClick={() => router.push(`/chat/${activeConnection.id}`)} className="mt-5 w-full rounded-full bg-[#5849F2] px-4 py-3 text-sm font-semibold text-[#FCFAF5] transition-colors hover:bg-[#4338CA]">
                  Open Chat
                </button>

                <div className="mt-5 flex gap-2 border-b border-[#E5E0D4] pb-3">
                  {(['overview', 'schema', 'history'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setOverviewTab(tab)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${overviewTab === tab ? 'bg-[#EDEAFF] text-[#5849F2]' : 'text-[#7B7E8F] hover:bg-[#F7F4EB]'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {overviewTab === 'overview' ? (
                  <div className="mt-4 space-y-3 text-sm">
                    {[
                      ['Host', getSafeHostDisplay(activeConnection)],
                      ['Port', activeConnection.port],
                      ['Database', activeConnection.dbName],
                      ['Username', maskUsername(activeConnection.username)],
                      ['Created', activeConnection.createdAt],
                      ['Last queried', activeConnection.lastQueried],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-3 border-b border-[#F0EBE1] pb-3 last:border-none">
                        <span className="text-[#7B7E8F]">{label}</span>
                        <span className="max-w-[60%] truncate text-right text-[#313852]">{value}</span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between gap-3 border-b border-[#F0EBE1] pb-3">
                      <span className="text-[#7B7E8F]">SSL</span>
                      <span className={`rounded-full border px-3 py-1 text-[11px] ${activeConnection.sslMode === 'Disable' ? 'border-[#F5D0A3] bg-[#FFF7EB] text-[#B35B00]' : 'border-[#BFE4C7] bg-[#E8F8EC] text-[#1C6B3C]'}`}>
                        {activeConnection.sslMode === 'Disable' ? 'No SSL' : 'SSL Enabled'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#7B7E8F]">Total queries run</span>
                      <NumberTicker value={activeConnection.totalQueries} className="text-lg font-semibold text-[#313852]" />
                    </div>

                    <button type="button" onClick={() => void runOverviewTest(activeConnection)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#313852] px-4 py-2.5 text-sm font-medium text-[#313852] transition-colors hover:bg-[#F7F4EB]">
                      {overviewTesting ? <SpinnerIcon /> : null}
                      Test Connection
                    </button>
                  </div>
                ) : null}

                {overviewTab === 'schema' ? (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-[#313852]">Schema snapshot</p>
                      <button type="button" aria-label="Refresh schema snapshot" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C2CBD4] text-[#7B7E8F] transition-colors hover:bg-[#F7F4EB] hover:text-[#313852]">
                        <RefreshIcon />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeConnection.schema.map(table => {
                        const tableKey = `${activeConnection.id}-${table.name}`
                        const isOpen = openTables[tableKey] ?? false
                        return (
                          <div key={table.name} className="rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-3">
                            <button type="button" onClick={() => setOpenTables(current => ({ ...current, [tableKey]: !isOpen }))} className="flex w-full items-center justify-between gap-3 text-left">
                              <div>
                                <p className="font-mono text-[13px] text-[#313852]">{table.name}</p>
                                <p className="mt-1 text-[11px] text-[#7B7E8F]">{table.rowCount}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="rounded-full border border-[#E5E0D4] bg-white px-2.5 py-1 text-[11px] text-[#5F6475]">{table.columns.length} cols</span>
                                {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                              </div>
                            </button>

                            {isOpen ? (
                              <div className="mt-3 space-y-2 border-t border-[#E5E0D4] pt-3">
                                {table.columns.map(column => (
                                  <div key={column.name} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5">
                                    <div className="flex items-center gap-2 font-mono text-[13px] text-[#313852]">
                                      <span>{column.name}</span>
                                      {column.isPrimaryKey ? <span className="text-[#B35B00]"><KeyIcon /></span> : null}
                                      {column.isForeignKey ? <span className="text-[#5849F2]"><LinkIcon /></span> : null}
                                    </div>
                                    <span className="rounded-full bg-[#EDEAFF] px-2.5 py-1 text-[11px] font-medium text-[#5849F2]">{column.type}</span>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {overviewTab === 'history' ? (
                  <div className="mt-4 space-y-3">
                    {activeConnection.history.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => router.push(`/chat/${activeConnection.id}?query=${encodeURIComponent(item.query)}`)}
                        className="flex w-full items-start justify-between gap-3 rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] px-3 py-3 text-left transition-colors hover:border-[#5849F2]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[13px] text-[#313852]">{item.query}</p>
                          <p className="mt-2 text-[11px] text-[#7B7E8F]">{item.timestamp}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${item.status === 'success' ? 'bg-[#E8F8EC] text-[#1C6B3C]' : 'bg-[#FEF3F2] text-[#B42318]'}`}>
                          {item.status === 'success' ? 'Success' : 'Failed'}
                        </span>
                      </button>
                    ))}

                    <button type="button" onClick={() => router.push(`/history?connection=${activeConnection.id}`)} className="inline-flex min-h-11 items-center text-sm font-medium text-[#5849F2] transition-colors hover:text-[#4338CA]">
                      See full history
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex min-h-[420px] flex-col justify-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F4EB] text-[#C2CBD4]">
                  <ChevronRightIcon />
                </div>
                <div className="text-center">
                  <p className="mt-5 font-display text-[18px] text-[#313852]">Connection details will appear here.</p>
                  <p className="mt-2 text-sm leading-7 text-[#7B7E8F]">After setup, this panel becomes your safety check: schema snapshot, health status, SSL, and query history.</p>
                </div>
                <div className="mt-6 space-y-3 rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-4 text-sm">
                  {['Schema sync status', 'Read-only health check', 'Chat entry when ready'].map(item => (
                    <div key={item} className="flex items-center gap-3 text-[#313852]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#D8D2FF]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {newDialogOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#313852]/35 px-3 py-3 sm:px-4 sm:py-6" role="presentation">
          <div ref={newDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="new-connection-title" aria-describedby="new-connection-description" className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[28px] border border-[#C2CBD4] bg-white shadow-[0_24px_80px_rgba(49,56,82,0.18)] outline-none sm:max-h-[calc(100dvh-3rem)]">
            <div className="shrink-0 border-b border-[#E5E0D4] bg-white px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B7E8F]">Connection setup</p>
                  <h2 id="new-connection-title" className="mt-2 font-display text-[24px] leading-none tracking-[-0.04em] text-[#313852]">Connect a database</h2>
                  <p id="new-connection-description" className="mt-2 max-w-[56ch] text-sm leading-6 text-[#7B7E8F]">Add credentials, test access, then save encrypted details for schema sync.</p>
                </div>
                <button type="button" aria-label="Close connection dialog" onClick={() => setNewDialogOpen(false)} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C2CBD4] text-[#7B7E8F] transition-colors hover:bg-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2">
                  <CloseIcon />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-[#5F6475]">
                {connectionTrustItems.map(item => (
                  <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-[#FCFAF5] px-3 py-1.5">
                    <LockIcon />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              <div className="grid gap-4">
                <section aria-labelledby="database-type-label" className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p id="database-type-label" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7B7E8F]">1. Database type</p>
                    <p className="hidden text-[12px] text-[#7B7E8F] sm:block">Choose the engine for defaults and parsing.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {dbTypeOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleDbTypeSelect(option.value)}
                        aria-pressed={form.dbType === option.value}
                        className={`flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border px-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 sm:min-h-14 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm ${form.dbType === option.value ? 'border-2 border-[#5849F2] bg-[#EDEAFF] text-[#5849F2]' : 'border-[#C2CBD4] bg-white text-[#313852] hover:bg-[#F7F4EB]'}`}
                      >
                        <ConnectionDbIcon dbType={option.value} />
                        <span className="block w-full text-center text-[11px] leading-tight sm:w-auto sm:text-left sm:text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-[24px] border border-[#E5E0D4] bg-[#FCFAF5]">
                  <div className="px-4 pt-4 sm:px-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7B7E8F]">2. Details</p>
                        <p className="mt-1 text-[13px] text-[#7B7E8F]">Use a read-only user when possible.</p>
                      </div>
                      <div className="inline-flex w-full rounded-full border border-[#C2CBD4] bg-white p-1 sm:w-auto">
                        <button type="button" onClick={() => setForm(current => ({ ...current, mode: 'connection-string' }))} className={`min-h-10 flex-1 rounded-full px-3 text-sm font-medium transition-colors sm:flex-none ${form.mode === 'connection-string' ? 'bg-[#F7F4EB] text-[#313852]' : 'text-[#7B7E8F] hover:text-[#313852]'}`}>
                          Connection String
                        </button>
                        <button type="button" onClick={() => setForm(current => ({ ...current, mode: 'manual' }))} className={`min-h-10 flex-1 rounded-full px-3 text-sm font-medium transition-colors sm:flex-none ${form.mode === 'manual' ? 'bg-[#F7F4EB] text-[#313852]' : 'text-[#7B7E8F] hover:text-[#313852]'}`}>
                          Manual Fields
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 px-4 py-4 sm:px-5">
                    {form.mode === 'connection-string' ? (
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.8fr)]">
                        <label className="block text-sm font-medium text-[#313852]">
                          Connection string
                          <textarea
                            aria-label="Database connection string"
                            value={form.connectionString}
                            onChange={event => setForm(current => ({ ...current, connectionString: event.target.value }))}
                            placeholder="postgresql://readonly_user:password@host:5432/dbname"
                            className="mt-2 h-28 w-full resize-none rounded-2xl border border-[#C2CBD4] bg-white px-4 py-3 font-mono text-sm leading-6 text-[#313852] outline-none transition-colors placeholder:text-[#8B8FA0] focus:border-[#5849F2]"
                          />
                        </label>

                        <label className="block text-sm font-medium text-[#313852]">
                          Connection name
                          <input
                            value={form.connectionName}
                            onChange={event => setForm(current => ({ ...current, connectionName: event.target.value }))}
                            placeholder="Analytics read replica"
                            className="mt-2 h-11 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm text-[#313852] outline-none transition-colors placeholder:text-[#8B8FA0] focus:border-[#5849F2]"
                          />
                          <span className="mt-2 block text-[12px] leading-5 text-[#7B7E8F]">Name it for the database or environment so teammates can audit later.</span>
                        </label>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <label className="text-sm font-medium text-[#313852]">Host<input value={form.host} onChange={event => setForm(current => ({ ...current, host: event.target.value, connectionName: current.connectionName || deriveConnectionName(current.dbName, event.target.value) }))} className="mt-2 h-11 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm outline-none transition-colors focus:border-[#5849F2]" /></label>
                        <label className="text-sm font-medium text-[#313852]">Port<input value={form.port} onChange={event => setForm(current => ({ ...current, port: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm outline-none transition-colors focus:border-[#5849F2]" /></label>
                        <label className="text-sm font-medium text-[#313852]">Database<input value={form.dbName} onChange={event => setForm(current => ({ ...current, dbName: event.target.value, connectionName: current.connectionName || deriveConnectionName(event.target.value, current.host) }))} className="mt-2 h-11 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm outline-none transition-colors focus:border-[#5849F2]" /></label>
                        <label className="text-sm font-medium text-[#313852]">Username<input value={form.username} onChange={event => setForm(current => ({ ...current, username: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm outline-none transition-colors focus:border-[#5849F2]" /></label>
                        <label className="text-sm font-medium text-[#313852]">Password<input type="password" value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm outline-none transition-colors focus:border-[#5849F2]" /></label>
                        <label className="text-sm font-medium text-[#313852]">SSL mode<select value={form.sslMode} onChange={event => setForm(current => ({ ...current, sslMode: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm outline-none transition-colors focus:border-[#5849F2]">{sslModeOptions.map(option => <option key={option}>{option}</option>)}</select></label>
                        <label className="text-sm font-medium text-[#313852] sm:col-span-2 lg:col-span-3">Connection name<input value={form.connectionName} onChange={event => setForm(current => ({ ...current, connectionName: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm outline-none transition-colors focus:border-[#5849F2]" /></label>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#E5E0D4] bg-white/45 px-4 py-3 sm:px-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7B7E8F]">3. Test before save</p>
                        <p className="mt-1 text-[13px] leading-6 text-[#7B7E8F]">Save stays disabled until Datavue confirms the connection works.</p>
                      </div>
                      {testState ? (
                        <div role="status" aria-live="polite" className={`rounded-2xl border px-4 py-3 text-sm sm:max-w-[340px] ${testState.tone === 'success' ? 'border-[#BFE4C7] bg-[#E4F0E8] text-[#1C6B3C]' : 'border-[#F0C4C4] bg-[#FEF3F2] text-[#B42318]'}`}>
                          <p className={testState.tone === 'error' ? 'font-mono text-[13px]' : ''}>{testState.message}</p>
                          {testState.tone === 'error' ? <button type="button" className="mt-2 text-sm font-medium text-[#5849F2]">Troubleshoot</button> : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="shrink-0 border-t border-[#E5E0D4] bg-[#FCFAF5] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="hidden max-w-[28ch] text-[12px] leading-5 text-[#7B7E8F] sm:block">Encrypted credentials are hidden after saving.</p>
                <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:justify-end">
                  <button type="button" onClick={() => setNewDialogOpen(false)} className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-[#C2CBD4] px-5 text-sm font-medium text-[#313852] transition-colors hover:bg-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 sm:flex-none sm:min-w-[104px]">Cancel</button>
                  <button type="button" onClick={() => void handleTestConnection()} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#313852] px-5 text-sm font-medium text-[#313852] transition-colors hover:bg-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 sm:flex-none sm:min-w-[148px]">
                    {isTesting ? <SpinnerIcon /> : null}
                    Test Connection
                  </button>
                  <button type="button" disabled={!testState || testState.tone !== 'success' || isSaving} onClick={() => void handleSaveConnection()} className={`col-span-2 inline-flex h-11 flex-1 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 sm:col-span-1 sm:flex-none sm:min-w-[150px] ${!testState || testState.tone !== 'success' || isSaving ? 'cursor-not-allowed bg-[#A79EFA] text-[#FCFAF5]' : 'bg-[#5849F2] text-[#FCFAF5] hover:bg-[#4338CA]'}`}>
                    {isSaving ? 'Saving...' : 'Save Connection'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {upgradeDialogOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#313852]/35 p-4" role="presentation">
          <div ref={upgradeDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="upgrade-dialog-title" className="w-full max-w-md rounded-[28px] border border-[#C2CBD4] bg-white p-6 shadow-[0_24px_80px_rgba(49,56,82,0.18)] outline-none">
            <h2 id="upgrade-dialog-title" className="font-display text-[22px] leading-none tracking-[-0.04em] text-[#313852]">Upgrade to Pro</h2>
            <p className="mt-3 text-sm leading-7 text-[#7B7E8F]">Starter currently supports up to {starterConnectionLimit} saved connections. Upgrade to Pro for unlimited connection slots, expanded query history, and faster schema refreshes.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setUpgradeDialogOpen(false)} className="rounded-full border border-[#C2CBD4] px-4 py-2.5 text-sm font-medium text-[#313852]">Maybe later</button>
              <button type="button" className="rounded-full bg-[#5849F2] px-4 py-2.5 text-sm font-semibold text-[#FCFAF5]">View upgrade options</button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#313852]/35 p-4" role="presentation">
          <div ref={deleteDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" className="w-full max-w-md rounded-[28px] border border-[#C2CBD4] bg-white p-6 shadow-[0_24px_80px_rgba(49,56,82,0.18)] outline-none">
            <h2 id="delete-dialog-title" className="font-display text-[22px] leading-none tracking-[-0.04em] text-[#313852]">Delete connection</h2>
            <p className="mt-3 text-sm leading-7 text-[#7B7E8F]">This will permanently delete the <b className="text-[#313852]">{deleteTarget.name}</b> connection and its related chat, audit logs, schema metadata, insights, metrics, and dashboard widgets. Type the connection name to confirm.</p>
            <input value={deleteConfirmation} onChange={event => setDeleteConfirmation(event.target.value)} disabled={deletingConnectionId === deleteTarget.id} className="mt-4 h-11 w-full rounded-2xl border border-[#C2CBD4] bg-[#FCFAF5] px-4 outline-none focus:border-[#5849F2] disabled:cursor-not-allowed disabled:opacity-70" placeholder={deleteTarget.name} />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" disabled={deletingConnectionId === deleteTarget.id} onClick={() => setDeleteDialogId(null)} className="rounded-full border border-[#C2CBD4] px-4 py-2.5 text-sm font-medium text-[#313852] disabled:cursor-not-allowed disabled:opacity-70">Cancel</button>
              <button type="button" disabled={deletingConnectionId === deleteTarget.id || deleteConfirmation !== deleteTarget.name} onClick={() => void handleDeleteConnection()} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${deletingConnectionId === deleteTarget.id || deleteConfirmation !== deleteTarget.name ? 'cursor-not-allowed bg-[#F6C6CD] text-[#FCFAF5]' : 'bg-[#DC3545] text-[#FCFAF5]'}`}>
                {deletingConnectionId === deleteTarget.id ? <SpinnerIcon /> : null}
                {deletingConnectionId === deleteTarget.id ? 'Deleting...' : 'Permanently delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-full max-w-sm flex-col gap-3">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto rounded-2xl border bg-white p-4 shadow-[0_20px_60px_rgba(49,56,82,0.12)] ${toast.tone === 'success' ? 'border-[#BFE4C7]' : toast.tone === 'error' ? 'border-[#F0C4C4]' : 'border-[#C2CBD4]'}`}>
            <p className="text-sm font-medium text-[#313852]">{toast.title}</p>
            <p className="mt-1 text-sm leading-6 text-[#7B7E8F]">{toast.description}</p>
            {toast.actionLabel && toast.actionConnectionId ? (
              <button type="button" onClick={() => router.push(`/chat/${toast.actionConnectionId}`)} className="mt-3 text-sm font-medium text-[#5849F2] transition-colors hover:text-[#4338CA]">
                {toast.actionLabel}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="sr-only" aria-live="polite">{connectionNotifications.join(' ')}</div>
    </div>
  )
}
