import { Pool, PoolClient } from 'pg'
import {
  DatabaseDriver,
  ConnectionCredentials,
  TableMetadata,
  ColumnMetadata,
  ForeignKeyMetadata,
  QueryResult,
} from './base.driver'

const QUERY_TIMEOUT_MS = 30_000
const MAX_ROWS = 10_000
const POOL_MAX = 5

export class PostgresDriver implements DatabaseDriver {
  private pool: Pool

  constructor(private credentials: ConnectionCredentials) {
    this.pool = new Pool({
      host: credentials.host,
      port: credentials.port,
      user: credentials.user,
      password: credentials.password,
      database: credentials.database,
      ssl: credentials.ssl ? { rejectUnauthorized: false } : false,
      max: POOL_MAX,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
    })
  }

  // ─── Test Connection ─────────────────────────────────────────────────────
  async testConnection(): Promise<{ success: boolean; latencyMs: number }> {
    const start = Date.now()
    let client: PoolClient | null = null

    try {
      client = await this.pool.connect()
      await client.query('SELECT 1')
      return { success: true, latencyMs: Date.now() - start }
    } finally {
      client?.release()
    }
  }

  // ─── Sync Metadata ───────────────────────────────────────────────────────
  async syncMetadata(): Promise<TableMetadata[]> {
    let client: PoolClient | null = null

    try {
      client = await this.pool.connect()

      // Step 1: Get all user tables
      const tablesResult = await client.query(`
        SELECT 
          table_name,
          table_schema
        FROM information_schema.tables
        WHERE 
          table_schema NOT IN ('pg_catalog', 'information_schema')
          AND table_type = 'BASE TABLE'
        ORDER BY table_schema, table_name
      `)

      const tables: TableMetadata[] = []

      for (const row of tablesResult.rows) {
        const tableName = row.table_name as string
        const schemaName = row.table_schema as string

        // Step 2: Get columns for this table
        const columnsResult = await client.query(`
          SELECT
            c.column_name,
            CASE
              WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name
              WHEN c.data_type = 'ARRAY' THEN c.udt_name || '[]'
              ELSE c.data_type
            END as data_type,
            c.is_nullable,
            c.column_default,
            CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
            CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key
          FROM information_schema.columns c
          LEFT JOIN (
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_name = $1
              AND tc.table_schema = $2
          ) pk ON c.column_name = pk.column_name
          LEFT JOIN (
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name = $1
              AND tc.table_schema = $2
          ) fk ON c.column_name = fk.column_name
          WHERE c.table_name = $1
            AND c.table_schema = $2
          ORDER BY c.ordinal_position
        `, [tableName, schemaName])

        const columns: ColumnMetadata[] = columnsResult.rows.map((col) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default,
          isPrimaryKey: col.is_primary_key,
          isForeignKey: col.is_foreign_key,
        }))

        // Step 3: Get primary keys
        const pkResult = await client.query(`
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_name = $1
            AND tc.table_schema = $2
        `, [tableName, schemaName])

        const primaryKeys = pkResult.rows.map((r) => r.column_name as string)

        // Step 4: Get foreign keys
        const fkResult = await client.query(`
          SELECT
            kcu.column_name,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column,
            rc.delete_rule
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name
          JOIN information_schema.constraint_column_usage ccu
            ON rc.unique_constraint_name = ccu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = $1
            AND tc.table_schema = $2
        `, [tableName, schemaName])

        const foreignKeys: ForeignKeyMetadata[] = fkResult.rows.map((fk) => ({
          columnName: fk.column_name,
          referencedTable: fk.referenced_table,
          referencedColumn: fk.referenced_column,
          onDelete: fk.delete_rule,
        }))

        // Step 5: Get indexes
        const indexResult = await client.query(`
          SELECT indexname
          FROM pg_indexes
          WHERE tablename = $1
            AND schemaname = $2
        `, [tableName, schemaName])

        const indexes = indexResult.rows.map((r) => r.indexname as string)

        // Step 6: Get row estimate from pg stats
        const rowEstimateResult = await client.query(`
          SELECT reltuples::bigint AS estimate
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relname = $1
            AND n.nspname = $2
        `, [tableName, schemaName])

        const rowEstimate = Number(
          rowEstimateResult.rows[0]?.estimate ?? 0
        )

        tables.push({
          tableName,
          schemaName,
          columns,
          primaryKeys,
          foreignKeys,
          indexes,
          rowEstimate,
        })
      }

      return tables
    } finally {
      client?.release()
    }
  }

  // ─── Execute Query ───────────────────────────────────────────────────────
  async executeQuery(sql: string): Promise<QueryResult> {
    let client: PoolClient | null = null

    try {
      client = await this.pool.connect()

      // Enforce query timeout at the DB level
      await client.query(`SET statement_timeout = ${QUERY_TIMEOUT_MS}`)

      // Wrap in a row-limited subquery to enforce MAX_ROWS
      const limitedSql = `
        SELECT * FROM (${sql}) AS __datavue_result
        LIMIT ${MAX_ROWS + 1}
      `

      const result = await client.query(limitedSql)

      const rows = result.rows.slice(0, MAX_ROWS)
      const fields = result.fields.map((f) => f.name)

      return {
        rows,
        rowCount: rows.length,
        fields,
      }
    } finally {
      client?.release()
    }
  }

  // ─── Get Row Count ───────────────────────────────────────────────────────
  async getRowCount(tableName: string): Promise<number> {
    let client: PoolClient | null = null

    try {
      client = await this.pool.connect()

      const result = await client.query(`
        SELECT reltuples::bigint AS estimate
        FROM pg_class
        WHERE relname = $1
      `, [tableName])

      return Number(result.rows[0]?.estimate ?? 0)
    } finally {
      client?.release()
    }
  }

  // ─── Disconnect ──────────────────────────────────────────────────────────
  async disconnect(): Promise<void> {
    await this.pool.end()
  }
}
