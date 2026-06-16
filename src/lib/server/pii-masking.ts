// ─── PII Masking ────────────────────────────────────────────────────────────
// Shared two-layer redaction used by both the table-preview path and the chat
// agent. Layer 1: column-name blocklist (known sensitive identifiers + any
// user-configured columns). Layer 2: value regex scan to catch PII hiding in
// innocuously named columns. Anything detected is replaced with a typed
// `[REDACTED: type]` token before the data is shown to the user or sent to the
// LLM.

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

// A bare number with no separators or symbols — e.g. an aggregate (SUM/COUNT),
// a bigint id, or a money/numeric value, all of which node-postgres returns as
// JS *strings*. These must never be value-detected as PII; doing so redacts
// numeric chart axes and feeds `[REDACTED]` to the LLM. Genuinely sensitive
// numeric data (card_number, ssn, phone) is still caught by the column-name
// blocklist, and separator-formatted values (123-45-6789, 1234-5678-...) still
// match the patterns below because they are not bare numbers.
const bareNumberPattern = /^[+-]?\d+(\.\d+)?$/

export function normalizeColumnName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

export function detectSensitiveValueType(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  // Skip bare numeric strings (stringified aggregates, ids, money/numeric
  // columns). See bareNumberPattern above.
  if (bareNumberPattern.test(trimmedValue)) {
    return null
  }

  if (emailPattern.test(trimmedValue)) return 'email'
  if (ssnPattern.test(trimmedValue)) return 'ssn'
  if (cardPattern.test(trimmedValue)) return 'card'
  if (phonePattern.test(trimmedValue)) return 'phone'

  return null
}

export function sanitizeValue(value: unknown): unknown {
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
    return value.map(sanitizeValue)
  }

  if (ArrayBuffer.isView(value)) {
    return `[binary ${(value as ArrayBufferView).byteLength} bytes]`
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        sanitizeValue(nestedValue),
      ]),
    )
  }

  return value
}

export type MaskResult = {
  rows: Record<string, unknown>[]
  maskedColumns: string[]
}

/**
 * Redact sensitive columns from a result set.
 *
 * @param rows       the result rows
 * @param fields     the column names present in the result
 * @param piiColumns user-configured additional column names to always mask
 */
export function maskRows(
  rows: Record<string, unknown>[],
  fields: string[],
  piiColumns: string[],
): MaskResult {
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
      nextRow[field] = maskType ? `[REDACTED: ${maskType}]` : sanitizeValue(row[field])
    }

    return nextRow
  })

  return {
    rows: nextRows,
    maskedColumns: Array.from(maskedColumns.keys()),
  }
}
