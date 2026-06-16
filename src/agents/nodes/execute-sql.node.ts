import { createDriver } from '@/db/drivers'
import { decryptObject } from '@/lib/encryption'
import { prisma } from '@/lib/prisma'
import { ConnectionCredentials } from '@/db/drivers/base.driver'
import { AgentStateType, QueryResult, SqlAttempt } from '../state'
import { DBType } from '@/generated/prisma/enums'
import { maskRows } from '@/lib/server/pii-masking'

const MAX_ROWS = 10_000

function updateLastAttemptError(
  attempts: SqlAttempt[],
  errorMessage: string
): SqlAttempt[] {
  if (attempts.length === 0) {
    return attempts
  }

  return attempts.map((attempt, index) => {
    if (index === attempts.length - 1) {
      return {
        ...attempt,
        error: errorMessage,
      }
    }

    return attempt
  })
}

export async function executeSQLNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  console.log(`[executeSQL] Executing: ${state.currentSql.slice(0, 120)}...`)

  // ── Step 1: Fetch connection metadata and verify ownership ────────────────
  const connection = await prisma.connection.findFirst({
    where: {
      id: state.connectionId,
      userId: state.userId,
      isArchived: false,
    },
    select: {
      dbType: true,
      encryptedCredentials: true,
      piiColumns: true,
    },
  })

  if (!connection) {
    return {
      lastError: 'Connection not found or access denied.',
      isBlocked: true,
      blockedReason: 'Connection not found or access denied.',
    }
  }

  // ── Step 2: Decrypt credentials ───────────────────────────────────────────
  let credentials: ConnectionCredentials

  try {
    credentials = decryptObject<ConnectionCredentials>(
      connection.encryptedCredentials
    )
  } catch {
    return {
      lastError: 'Failed to decrypt connection credentials.',
      isBlocked: true,
      blockedReason: 'Failed to decrypt connection credentials.',
    }
  }

  const driver = createDriver(connection.dbType as DBType, credentials, {
    shared: true,
    poolKey: state.connectionId,
  })

  try {
    // ── Step 3: Execute validated SQL ───────────────────────────────────────
    const raw = await driver.executeQuery(state.currentSql)

    // ── Step 4: Truncation signal comes from the driver ─────────────────────
    // The driver fetched one row past the cap to detect overflow and already
    // capped raw.rows to MAX_ROWS, so we trust raw.wasTruncated here rather
    // than re-deriving it (the old `rowCount > MAX_ROWS` check was always false
    // because rowCount was already capped).
    const isTruncated = raw.wasTruncated

    // ── Step 5: Mask PII before results reach the LLM or the user ────────────
    // The same two-layer redaction used by the data-explorer preview path.
    // Masking here guarantees no raw PII is sent to the visualization/response
    // nodes (and thus the LLM provider) or streamed back to the client.
    const masked = maskRows(raw.rows, raw.fields, connection.piiColumns)

    const queryResult: QueryResult = {
      rows: masked.rows,
      rowCount: raw.rowCount,
      returnedRowCount: masked.rows.length,
      fields: raw.fields,
      isTruncated,
    }

    if (isTruncated) {
      console.warn(
        `[executeSQL] Result truncated at ${MAX_ROWS} rows (more rows matched than the cap)`
      )
    }

    if (masked.maskedColumns.length > 0) {
      console.log(
        `[executeSQL] 🔒 Masked ${masked.maskedColumns.length} column(s): ${masked.maskedColumns.join(', ')}`
      )
    }

    console.log(
      `[executeSQL] ✅ Success — returnedRows=${queryResult.returnedRowCount}, truncated=${isTruncated}`
    )

    return {
      queryResult,
      maskedColumns: masked.maskedColumns,
      lastError: '',
    }
  } catch (error) {
    // ── Step 5: Capture execution error for retry/self-heal ─────────────────
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown database error'

    console.error(`[executeSQL] ❌ Failed — ${errorMessage}`)

    return {
      lastError: errorMessage,
      sqlAttempts: updateLastAttemptError(state.sqlAttempts, errorMessage),
    }
  } finally {
    await driver.disconnect()
  }
}