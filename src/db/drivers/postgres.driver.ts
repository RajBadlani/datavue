import { Pool, PoolClient } from "pg";
import {
    DatabaseDriver,
    ConnectionCredentials,
    TableMetadata,
    ColumnMetadata,
    ForeignKeyMetadata,
    QueryResult,
    TablePreviewOptions,
} from "./base.driver";

const QUERY_TIMEOUT_MS = 30_000;
const MAX_ROWS = 10_000;
const POOL_MAX = 5;

export type PostgresDriverOptions = {
    /** Reuse a process-cached pool keyed by `poolKey` instead of a throwaway pool. */
    shared?: boolean;
    /** Stable key for the shared pool (use the connection id). Required when shared. */
    poolKey?: string;
};

// Process-wide cache of shared pools, keyed by connection id. Guarded on
// globalThis so dev hot-reload does not spawn duplicate caches (same pattern as
// the prisma/redis singletons).
const globalForPgPools = globalThis as unknown as {
    __datavuePgPools?: Map<string, Pool>;
};

const sharedPools: Map<string, Pool> =
    globalForPgPools.__datavuePgPools ?? new Map<string, Pool>();

if (process.env.NODE_ENV !== "production") {
    globalForPgPools.__datavuePgPools = sharedPools;
}

/**
 * Evict and close the cached shared pool for a connection. Call this when a
 * connection is deleted (or its credentials change) so the Pool object and its
 * open sockets are released instead of leaking on globalThis. No-op if there is
 * no cached pool for the key. Errors during teardown are swallowed so callers
 * (e.g. a DELETE handler) never fail on cleanup.
 */
export async function evictSharedPool(poolKey: string): Promise<void> {
    const pool = sharedPools.get(poolKey);
    if (!pool) {
        return;
    }

    sharedPools.delete(poolKey);

    try {
        await pool.end();
    } catch (error) {
        console.error(`[postgres-driver] Failed to end pool for ${poolKey}:`, error);
    }
}

export class PostgresDriver implements DatabaseDriver {
    private pool: Pool;
    private isShared: boolean;

    private quoteIdentifier(value: string): string {
        return `"${value.replace(/"/g, '""')}"`;
    }

    private normalizeEnumValues(value: unknown): string[] | null {
        if (!Array.isArray(value)) {
            return null;
        }

        const enumValues = value.filter(
            (item): item is string => typeof item === "string",
        );

        return enumValues.length > 0 ? enumValues : null;
    }

    constructor(
        private credentials: ConnectionCredentials,
        options: PostgresDriverOptions = {},
    ) {
        this.isShared = Boolean(options.shared && options.poolKey);

        if (this.isShared) {
            const key = options.poolKey as string;
            const existing = sharedPools.get(key);

            if (existing) {
                this.pool = existing;
            } else {
                this.pool = PostgresDriver.createPool(credentials);
                sharedPools.set(key, this.pool);
            }
        } else {
            this.pool = PostgresDriver.createPool(credentials);
        }
    }

    private static createPool(credentials: ConnectionCredentials): Pool {
        const pool = new Pool({
            host: credentials.host,
            port: credentials.port,
            user: credentials.user,
            password: credentials.password,
            database: credentials.database,
            ssl: PostgresDriver.buildSslConfig(credentials),
            max: POOL_MAX,
            connectionTimeoutMillis: 10_000,
            idleTimeoutMillis: 30_000,
        });

        // A long-lived (shared) pool WILL eventually see an idle client error
        // (DB restart, network blip). Without this listener, node-postgres
        // re-emits it as an uncaught 'error' on the pool and crashes the
        // process. Swallow-and-log so a transient backend hiccup cannot take
        // the web server down; the pool reconnects on the next checkout.
        pool.on("error", (err) => {
            console.error("[postgres-driver] Idle client error:", err.message);
        });

        return pool;
    }

    // ─── SSL Config ──────────────────────────────────────────────────────────
    // Verify the server certificate by default. A man-in-the-middle who can
    // present any certificate would otherwise capture the user's database
    // credentials and query data, defeating the point of enabling SSL. Users on
    // trusted networks with self-signed certs can supply a CA, or explicitly opt
    // out of verification via sslRejectUnauthorized: false.
    private static buildSslConfig(
        credentials: ConnectionCredentials,
    ): false | { rejectUnauthorized: boolean; ca?: string } {
        if (!credentials.ssl) {
            return false;
        }

        const rejectUnauthorized = credentials.sslRejectUnauthorized ?? true;

        if (credentials.caCert) {
            return { rejectUnauthorized, ca: credentials.caCert };
        }

        return { rejectUnauthorized };
    }

    // ─── Test Connection ─────────────────────────────────────────────────────
    async testConnection(): Promise<{ success: boolean; latencyMs: number }> {
        const start = Date.now();
        let client: PoolClient | null = null;

        try {
            client = await this.pool.connect();
            await client.query("SELECT 1");
            return { success: true, latencyMs: Date.now() - start };
        } finally {
            client?.release();
        }
    }

    // ─── Sync Metadata ───────────────────────────────────────────────────────
    async syncMetadata(): Promise<TableMetadata[]> {
        let client: PoolClient | null = null;

        try {
            client = await this.pool.connect();

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
            `);

            const tables: TableMetadata[] = [];

            for (const row of tablesResult.rows) {
                const tableName = row.table_name as string;
                const schemaName = row.table_schema as string;

                // Step 2: Get columns for this table
                const columnsResult = await client.query(
                    `
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
                `,
                    [tableName, schemaName],
                );
                // After getting columns, fetch enum values for this table's enum columns
                const enumResult = await client.query(
                    `
                    SELECT 
                    a.attname as column_name,
                    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
                    FROM pg_attribute a
                    JOIN pg_class c ON c.oid = a.attrelid
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    JOIN pg_type t ON t.oid = a.atttypid
                    JOIN pg_enum e ON e.enumtypid = t.oid
                    WHERE c.relname = $1
                    AND n.nspname = $2
                    AND a.attnum > 0
                    GROUP BY a.attname
                    `,
                    [tableName, schemaName],
                );
                
                // Build a map of columnName → enum values
                const enumMap = new Map<string, string[]>();
                for (const row of enumResult.rows) {
                    const raw = row.enum_values;

                    // pg driver returns array_agg as a Postgres array literal string: '{VAL1,VAL2,VAL3}'
                    // We need to parse it into a JS array
                    let values: string[] = [];

                    if (Array.isArray(raw)) {
                        // Already a JS array (some pg configurations do return arrays)
                        values = raw.map(String);
                    } else if (
                        typeof raw === "string" &&
                        raw.startsWith("{") &&
                        raw.endsWith("}")
                    ) {
                        // Postgres array literal — strip braces and split
                        values = raw
                            .slice(1, -1) // remove { and }
                            .split(",") // split by comma
                            .map((v) => v.trim()) // trim whitespace
                            .filter(Boolean); // remove empty strings
                    }

                    if (values.length > 0) {
                        enumMap.set(row.column_name, values);
                    }
                }
                const columns: ColumnMetadata[] = columnsResult.rows.map(
                    (col) => ({
                        name: col.column_name,
                        type: col.data_type,
                        nullable: col.is_nullable === "YES",
                        default: col.column_default,
                        isPrimaryKey: col.is_primary_key,
                        isForeignKey: col.is_foreign_key,
                        enumValues: enumMap.get(col.column_name) ?? null, // ← new field
                    }),
                );

                // Step 3: Get primary keys
                const pkResult = await client.query(
                    `
          SELECT kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_name = $1
            AND tc.table_schema = $2
        `,
                    [tableName, schemaName],
                );

                const primaryKeys = pkResult.rows.map(
                    (r) => r.column_name as string,
                );

                // Step 4: Get foreign keys
                const fkResult = await client.query(
                    `
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
        `,
                    [tableName, schemaName],
                );

                const foreignKeys: ForeignKeyMetadata[] = fkResult.rows.map(
                    (fk) => ({
                        columnName: fk.column_name,
                        referencedTable: fk.referenced_table,
                        referencedColumn: fk.referenced_column,
                        onDelete: fk.delete_rule,
                    }),
                );

                // Step 5: Get indexes
                const indexResult = await client.query(
                    `
          SELECT indexname
          FROM pg_indexes
          WHERE tablename = $1
            AND schemaname = $2
        `,
                    [tableName, schemaName],
                );

                const indexes = indexResult.rows.map(
                    (r) => r.indexname as string,
                );

                // Step 6: Get row estimate from pg stats
                const rowEstimateResult = await client.query(
                    `
          SELECT reltuples::bigint AS estimate
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relname = $1
            AND n.nspname = $2
        `,
                    [tableName, schemaName],
                );

                const rowEstimate = Number(
                    rowEstimateResult.rows[0]?.estimate ?? 0,
                );

                tables.push({
                    tableName,
                    schemaName,
                    columns,
                    primaryKeys,
                    foreignKeys,
                    indexes,
                    rowEstimate,
                });
            }

            return tables;
        } finally {
            client?.release();
        }
    }

    // ─── Execute Query ───────────────────────────────────────────────────────
    async executeQuery(sql: string): Promise<QueryResult> {
        let client: PoolClient | null = null;

        try {
            client = await this.pool.connect();

            // Run inside a READ ONLY transaction so that even if the SQL
            // validator is bypassed, the database itself refuses any write
            // (INSERT/UPDATE/DELETE/DDL or a data-modifying function call).
            // This is the authoritative safety layer; the regex validator is
            // only the first line of defense.
            await client.query("BEGIN");

            try {
                await client.query("SET TRANSACTION READ ONLY");

                // Enforce the query timeout at the DB level. SET LOCAL keeps it
                // scoped to this transaction so it does not leak onto the pooled
                // connection after release.
                await client.query(
                    `SET LOCAL statement_timeout = ${QUERY_TIMEOUT_MS}`,
                );

                // Wrap in a row-limited subquery to enforce MAX_ROWS
                const limitedSql = `
            SELECT * FROM (${sql}) AS __datavue_result
            LIMIT ${MAX_ROWS + 1}
          `;

                const result = await client.query(limitedSql);

                await client.query("COMMIT");

                // Detect overflow BEFORE slicing: we fetched MAX_ROWS+1 as a
                // sentinel, so more than MAX_ROWS rows means the real result is
                // larger than the cap.
                const wasTruncated = result.rows.length > MAX_ROWS;
                const rows = result.rows.slice(0, MAX_ROWS);
                const fields = result.fields.map((f) => f.name);

                return {
                    rows,
                    rowCount: rows.length,
                    fields,
                    wasTruncated,
                };
            } catch (error) {
                // Roll back so the pooled connection is not returned in an
                // aborted-transaction state.
                await client.query("ROLLBACK").catch(() => {});
                throw error;
            }
        } finally {
            client?.release();
        }
    }

    async previewTable(options: TablePreviewOptions): Promise<QueryResult> {
        let client: PoolClient | null = null;

        try {
            client = await this.pool.connect();

            const safeLimit = Math.max(1, Math.floor(options.limit));
            const qualifiedTableName = `${this.quoteIdentifier(options.schemaName)}.${this.quoteIdentifier(options.tableName)}`;
            const orderByClause = options.orderBy?.length
                ? ` ORDER BY ${options.orderBy.map((column) => this.quoteIdentifier(column)).join(", ")}`
                : "";

            // Read-only transaction with a transaction-scoped timeout. SET LOCAL
            // keeps statement_timeout from leaking onto the pooled connection.
            await client.query("BEGIN");

            try {
                await client.query("SET TRANSACTION READ ONLY");
                await client.query(
                    `SET LOCAL statement_timeout = ${QUERY_TIMEOUT_MS}`,
                );

                const result = await client.query(
                    `SELECT * FROM ${qualifiedTableName}${orderByClause} LIMIT ${safeLimit + 1}`,
                );

                await client.query("COMMIT");

                return {
                    rows: result.rows,
                    rowCount: result.rows.length,
                    fields: result.fields.map((field) => field.name),
                    wasTruncated: result.rows.length > safeLimit,
                };
            } catch (error) {
                await client.query("ROLLBACK").catch(() => {});
                throw error;
            }
        } finally {
            client?.release();
        }
    }

    // ─── Get Row Count ───────────────────────────────────────────────────────
    async getRowCount(tableName: string): Promise<number> {
        let client: PoolClient | null = null;

        try {
            client = await this.pool.connect();

            const result = await client.query(
                `
        SELECT reltuples::bigint AS estimate
        FROM pg_class
        WHERE relname = $1
      `,
                [tableName],
            );

            return Number(result.rows[0]?.estimate ?? 0);
        } finally {
            client?.release();
        }
    }

    // ─── Disconnect ──────────────────────────────────────────────────────────
    async disconnect(): Promise<void> {
        // Shared pools are process-cached and reused across requests, so a
        // per-request caller must NOT tear them down. Only throwaway pools
        // (test/create/sync) actually end here.
        if (this.isShared) {
            return;
        }

        await this.pool.end();
    }
}
