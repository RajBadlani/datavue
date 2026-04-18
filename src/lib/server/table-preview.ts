import { createDriver, type ConnectionCredentials } from '@/db/drivers'
import { DBType } from '@/generated/prisma/enums'
import { ApiError, Errors } from '@/lib/api-error'
import { decryptObject } from '@/lib/encryption'
import prisma from '@/lib/prisma'

const DEFAULT_PREVIEW_LIMIT = 50
const MAX_PREVIEW_LIMIT = 100

const sensitiveColumnTypes = new Map([
  ['email', 'email'],
  ['email_address', 'email'],
  ['phone', 'phone'],
  ['phone_number', 'phone'],
  ['mobile', 'phone'],
  ['ssn', 'ssn'],
  ['social_security_number', 'ssn'],
  ['password', 'password'],
  ['password_hash', 'password'],
  ['token', 'token'],
  ['access_token', 'token'],
  ['refresh_token', 'token'],
  ['api_key', 'secret'],
  ['secret', 'secret'],
  ['card_number', 'card'],
  ['credit_card', 'card'],
  ['cvv', 'card'],
])

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const phonePattern = /^\+?[0-9][0-9\s().-]{7,}$/
const ssnPattern = /^\d{3}-\d{2}-\d{4}$/
const cardPattern = /^\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}$/

export type TablePreviewPayload = {
  tableId: string
  fields: string[]
  rows: Record<string, unknown>[]
  returnedRowCount: number
  isTruncated: boolean
  maskedColumns: string[]
  limit: number
}

function normalizeColumnName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

function clampPreviewLimit(limit?: number) {
  if (!Number.isFinite(limit)) {
    return DEFAULT_PREVIEW_LIMIT
  }

  return Math.min(MAX_PREVIEW_LIMIT, Math.max(1, Math.floor(limit ?? DEFAULT_PREVIEW_LIMIT)))
}

function detectSensitiveValueType(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  if (emailPattern.test(trimmedValue)) return 'email'
  if (ssnPattern.test(trimmedValue)) return 'ssn'
  if (cardPattern.test(trimmedValue)) return 'card'
  if (phonePattern.test(trimmedValue)) return 'phone'

  return null
}

function sanitizePreviewValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (Array.isArray(value)) {
    return value.map(sanitizePreviewValue)
  }

  if (ArrayBuffer.isView(value)) {
    return `[binary ${(value as ArrayBufferView).byteLength} bytes]`
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, sanitizePreviewValue(nestedValue)]),
    )
  }

  return value
}

function maskPreviewRows(rows: Record<string, unknown>[], fields: string[], piiColumns: string[]) {
  const configuredColumns = new Map(
    piiColumns.map(column => {
      const normalized = normalizeColumnName(column)
      return [normalized, sensitiveColumnTypes.get(normalized) ?? 'sensitive']
    }),
  )

  const maskedColumns = new Map<string, string>()

  for (const field of fields) {
    const normalizedField = normalizeColumnName(field)
    const configuredType = configuredColumns.get(normalizedField)
    const namedType = sensitiveColumnTypes.get(normalizedField)

    if (configuredType || namedType) {
      maskedColumns.set(field, configuredType ?? namedType ?? 'sensitive')
      continue
    }

    for (const row of rows) {
      const detectedType = detectSensitiveValueType(row[field])
      if (detectedType) {
        maskedColumns.set(field, detectedType)
        break
      }
    }
  }

  const nextRows = rows.map(row => {
    const nextRow: Record<string, unknown> = {}

    for (const field of fields) {
      const maskType = maskedColumns.get(field)
      nextRow[field] = maskType ? `[REDACTED: ${maskType}]` : sanitizePreviewValue(row[field])
    }

    return nextRow
  })

  return {
    rows: nextRows,
    maskedColumns: Array.from(maskedColumns.keys()),
  }
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
    driver = createDriver(connection.dbType as DBType, credentials)

    const result = await driver.previewTable({
      schemaName: table.schemaName,
      tableName: table.tableName,
      limit: safeLimit,
      orderBy: table.primaryKeys,
    })

    const rows = result.rows.slice(0, safeLimit)
    const masked = maskPreviewRows(rows, result.fields, connection.piiColumns)

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
