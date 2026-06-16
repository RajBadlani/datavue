import { createDriver, type ConnectionCredentials } from '@/db/drivers'
import { DBType } from '@/generated/prisma/enums'
import { ApiError, Errors } from '@/lib/api-error'
import { decryptObject } from '@/lib/encryption'
import prisma from '@/lib/prisma'
import { maskRows } from '@/lib/server/pii-masking'

const DEFAULT_PREVIEW_LIMIT = 50
const MAX_PREVIEW_LIMIT = 100

export type TablePreviewPayload = {
  tableId: string
  fields: string[]
  rows: Record<string, unknown>[]
  returnedRowCount: number
  isTruncated: boolean
  maskedColumns: string[]
  limit: number
}

function clampPreviewLimit(limit?: number) {
  if (!Number.isFinite(limit)) {
    return DEFAULT_PREVIEW_LIMIT
  }

  return Math.min(MAX_PREVIEW_LIMIT, Math.max(1, Math.floor(limit ?? DEFAULT_PREVIEW_LIMIT)))
}

export async function previewOwnedConnectionTable({
  userId,
  connectionId,
  tableId,
  limit,
}: {
  userId: string
  connectionId: string
  tableId: string
  limit?: number
}): Promise<TablePreviewPayload> {
  const safeLimit = clampPreviewLimit(limit)

  const connection = await prisma.connection.findFirst({
    where: {
      id: connectionId,
      userId,
      isArchived: false,
    },
    select: {
      id: true,
      dbType: true,
      encryptedCredentials: true,
      piiColumns: true,
      syncStatus: true,
      schemaMetadata: {
        where: {
          id: tableId,
        },
        select: {
          id: true,
          tableName: true,
          schemaName: true,
          primaryKeys: true,
        },
        take: 1,
      },
    },
  })

  if (!connection) {
    throw Errors.CONNECTION_NOT_FOUND
  }

  if (connection.syncStatus !== 'SYNCED') {
    throw new ApiError('SCHEMA_NOT_READY', 'Schema sync must complete before previewing table data', 409)
  }

  const table = connection.schemaMetadata[0]

  if (!table) {
    throw new ApiError('TABLE_NOT_FOUND', 'Table not found for this connection', 404)
  }

  let credentials: ConnectionCredentials

  try {
    credentials = decryptObject<ConnectionCredentials>(connection.encryptedCredentials)
  } catch (error) {
    console.error(`[table-preview] Failed to decrypt credentials for ${connection.id}:`, error)
    throw new ApiError('CREDENTIALS_UNAVAILABLE', 'Could not load connection credentials for preview', 500)
  }

  let driver: ReturnType<typeof createDriver> | null = null

  try {
    driver = createDriver(connection.dbType as DBType, credentials, {
      shared: true,
      poolKey: connection.id,
    })

    const result = await driver.previewTable({
      schemaName: table.schemaName,
      tableName: table.tableName,
      limit: safeLimit,
      orderBy: table.primaryKeys,
    })

    const rows = result.rows.slice(0, safeLimit)
    const masked = maskRows(rows, result.fields, connection.piiColumns)

    return {
      tableId: table.id,
      fields: result.fields,
      rows: masked.rows,
      returnedRowCount: masked.rows.length,
      isTruncated: result.rows.length > safeLimit,
      maskedColumns: masked.maskedColumns,
      limit: safeLimit,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    console.error(`[table-preview] Failed to load preview for ${connection.id}/${table.id}:`, error)
    throw new ApiError('TABLE_PREVIEW_FAILED', 'Could not load table preview', 502)
  } finally {
    if (driver) {
      await driver.disconnect()
    }
  }
}
