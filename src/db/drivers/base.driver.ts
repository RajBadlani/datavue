export interface ColumnMetadata {
  name: string
  type: string
  nullable: boolean
  default: string | null
  isPrimaryKey: boolean
  isForeignKey: boolean
}

export interface ForeignKeyMetadata {
  columnName: string
  referencedTable: string
  referencedColumn: string
  onDelete: string | null
}

export interface TableMetadata {
  tableName: string
  schemaName: string
  columns: ColumnMetadata[]
  primaryKeys: string[]
  foreignKeys: ForeignKeyMetadata[]
  indexes: string[]
  rowEstimate: number
}

export interface QueryResult {
  rows: Record<string, unknown>[]
  rowCount: number
  fields: string[]
}

export interface ConnectionCredentials {
  host: string
  port: number
  user: string
  password: string
  database: string
  ssl: boolean
}

export interface DatabaseDriver {
  testConnection(): Promise<{ success: boolean; latencyMs: number }>
  syncMetadata(): Promise<TableMetadata[]>
  executeQuery(sql: string): Promise<QueryResult>
  getRowCount(tableName: string): Promise<number>
  disconnect(): Promise<void>
}