export type ConnectionStatus = 'connected' | 'syncing' | 'unreachable' | 'untested'

export type DbType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'supabase' | 'planetscale'

export type SchemaColumn = {
  name: string
  type: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
}

export type SchemaTable = {
  name: string
  rowCount: string
  columns: SchemaColumn[]
}

export type QueryHistoryItem = {
  id: string
  query: string
  status: 'success' | 'failed'
  timestamp: string
}

export type ConnectionRecord = {
  id: string
  name: string
  host: string
  port: string
  dbName: string
  username: string
  dbType: DbType
  status: ConnectionStatus
  syncStatus?: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'
  version: string
  tableCount: number
  lastQueried: string
  createdAt: string
  totalQueries: number
  sslMode: string
  schema: SchemaTable[]
  history: QueryHistoryItem[]
  simulatedError?: string
}

export type ConnectionToast = {
  id: string
  tone: 'success' | 'error' | 'info'
  title: string
  description: string
  actionLabel?: string
  actionConnectionId?: string
}
