export interface ColumnMetadata {
  name:         string
  type:         string
  nullable:     boolean
  default:      string | null
  isPrimaryKey: boolean
  isForeignKey: boolean
  enumValues:   string[] | null
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
  /**
   * True when the underlying query matched more rows than the driver's row cap,
   * so `rows`/`rowCount` are a capped subset rather than the full result.
   */
  wasTruncated: boolean
}

export interface TablePreviewOptions {
  schemaName: string
  tableName: string
  limit: number
  orderBy?: string[]
}

export interface ConnectionCredentials {
  host: string
  port: number
  user: string
  password: string
  database: string
  ssl: boolean
  /**
   * When SSL is enabled, controls whether the server's certificate chain is
   * verified. Defaults to true (verify) when omitted. Set to false only for
   * trusted networks with self-signed certs where a CA cannot be supplied.
   */
  sslRejectUnauthorized?: boolean
  /** Optional PEM-encoded CA certificate used to verify a self-signed server cert. */
  caCert?: string
}

export interface DatabaseDriver {
  testConnection(): Promise<{ success: boolean; latencyMs: number }>
  syncMetadata(): Promise<TableMetadata[]>
  executeQuery(sql: string): Promise<QueryResult>
  previewTable(options: TablePreviewOptions): Promise<QueryResult>
  getRowCount(tableName: string): Promise<number>
  disconnect(): Promise<void>
}
