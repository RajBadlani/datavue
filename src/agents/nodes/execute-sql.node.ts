import { createDriver } from '@/db/drivers'
import { decryptObject } from '@/lib/encryption'
import { prisma } from '@/lib/prisma'
import { ConnectionCredentials } from '@/db/drivers/base.driver'
import { AgentStateType, QueryResult, SqlAttempt } from '../state'
import { DBType } from '@/generated/prisma/enums'

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

  const driver = createDriver(connection.dbType as DBType, credentials)

  try {
    // ── Step 3: Execute validated SQL ───────────────────────────────────────
    const raw = await driver.executeQuery(state.currentSql)

    // ── Step 4: Apply row cap for safety ────────────────────────────────────
    const isTruncated = raw.rowCount > MAX_ROWS
    const rows = raw.rows.slice(0, MAX_ROWS)

    const queryResult: QueryResult = {
      rows,
      rowCount: raw.rowCount,
      returnedRowCount: rows.length,
      fields: raw.fields,
      isTruncated,
    }

    if (isTruncated) {
      console.warn(
        `[executeSQL] Result truncated: totalRows=${raw.rowCount}, returnedRows=${rows.length}, limit=${MAX_ROWS}`
      )
    }

    console.log(
      `[executeSQL] ✅ Success — totalRows=${queryResult.rowCount}, returnedRows=${queryResult.returnedRowCount}`
    )

    return {
      queryResult,
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