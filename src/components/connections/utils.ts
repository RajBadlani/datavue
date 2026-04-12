import { dbTypeOptions } from '@/components/connections/constants'
import type { ConnectionRecord, DbType } from '@/components/connections/types'
import { DBType, SyncStatus } from '@/generated/prisma/enums'

export function maskUsername(username: string) {
  if (username.length <= 2) return `${username[0] ?? '*'}*`
  return `${username.slice(0, 2)}${'*'.repeat(Math.max(2, username.length - 2))}`
}

export function getDbDefaultPort(dbType: DbType) {
  return dbTypeOptions.find(option => option.value === dbType)?.defaultPort ?? ''
}

export function getConnectionStatusMeta(status: ConnectionRecord['status']) {
  if (status === 'connected') {
    return { label: 'Connected', dot: '#22C55E', badge: 'bg-[#E8F8EC] text-[#1C6B3C] border-[#BFE4C7]' }
  }
  if (status === 'syncing') {
    return { label: 'Syncing', dot: '#5849F2', badge: 'bg-[#EDEAFF] text-[#5849F2] border-[#D8D2FF]' }
  }
  if (status === 'unreachable') {
    return { label: 'Unreachable', dot: '#DC3545', badge: 'bg-[#FEF3F2] text-[#B42318] border-[#F0C4C4]' }
  }
  return { label: 'Not tested', dot: '#C2CBD4', badge: 'bg-[#F7F4EB] text-[#7B7E8F] border-[#E5E0D4]' }
}

export function getDbLabel(dbType: DbType) {
  return dbTypeOptions.find(option => option.value === dbType)?.label ?? dbType
}

export function toApiDbType(dbType: DbType): typeof DBType[keyof typeof DBType] {
  if (dbType === 'postgresql' || dbType === 'supabase') return DBType.POSTGRES
  if (dbType === 'mysql' || dbType === 'planetscale') return DBType.MYSQL
  if (dbType === 'mongodb') return DBType.MONGODB
  return DBType.SQLITE
}

export function fromApiDbType(dbType: string): DbType {
  if (dbType === DBType.POSTGRES) return 'postgresql'
  if (dbType === DBType.MYSQL) return 'mysql'
  if (dbType === DBType.MONGODB) return 'mongodb'
  return 'sqlite'
}

export function statusFromSyncStatus(syncStatus?: string): ConnectionRecord['status'] {
  if (syncStatus === SyncStatus.SYNCED) return 'connected'
  if (syncStatus === SyncStatus.SYNCING || syncStatus === SyncStatus.PENDING) return 'syncing'
  if (syncStatus === SyncStatus.FAILED) return 'unreachable'
  return 'untested'
}

export function formatCreatedAt(dateString: string) {
  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) return dateString
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatLastQueried(lastSyncedAt?: string | null) {
  if (!lastSyncedAt) return 'Never'
  const parsed = new Date(lastSyncedAt)
  if (Number.isNaN(parsed.getTime())) return 'Never'

  const diffMs = Date.now() - parsed.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function parseConnectionString(connectionString: string, dbType: DbType) {
  try {
    const normalized = dbType === 'mongodb' && !connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')
      ? `mongodb://${connectionString}`
      : connectionString
    const parsed = new URL(normalized)

    return {
      host: parsed.hostname,
      port: parsed.port || getDbDefaultPort(dbType),
      dbName: parsed.pathname.replace(/^\//, ''),
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      sslMode: parsed.searchParams.get('sslmode') || 'Require',
    }
  } catch {
    return null
  }
}

export function deriveConnectionName(dbName: string, host: string) {
  const hostLabel = host.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase()
  const dbLabel = dbName.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase()
  return [dbLabel, hostLabel].filter(Boolean).join('-') || 'new-connection'
}

export function parseEnvCandidates(content: string) {
  const matches: Array<{ key: string; value: string; dbType: DbType }> = []
  const lines = content.split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue

    const [rawKey, ...rest] = line.split('=')
    const key = rawKey.trim()
    const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '')
    const lowered = value.toLowerCase()

    if (key.includes('DATABASE_URL') || key.includes('POSTGRES') || lowered.startsWith('postgres://')) {
      matches.push({ key, value, dbType: 'postgresql' })
    } else if (key.includes('MYSQL') || lowered.startsWith('mysql://')) {
      matches.push({ key, value, dbType: 'mysql' })
    } else if (key.includes('MONGO') || lowered.startsWith('mongodb://') || lowered.startsWith('mongodb+srv://')) {
      matches.push({ key, value, dbType: 'mongodb' })
    } else if (key.includes('SQLITE') || lowered.startsWith('file:')) {
      matches.push({ key, value, dbType: 'sqlite' })
    }
  }

  return matches
}

export function sortConnections(connections: ConnectionRecord[], sortBy: string) {
  const sorted = [...connections]

  if (sortBy === 'name') {
    return sorted.sort((a, b) => a.name.localeCompare(b.name))
  }

  if (sortBy === 'created') {
    return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  return sorted.sort((a, b) => a.lastQueried.localeCompare(b.lastQueried))
}
