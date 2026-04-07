import { AgentStateType } from '../state'

// ─── Blocked SQL Keywords ─────────────────────────────────────────────────────
// Validator should stay deterministic and conservative.
const BLOCKED_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'ALTER',
  'CREATE',
  'TRUNCATE',
  'GRANT',
  'REVOKE',
  'MERGE',
  'CALL',
  'EXEC',
  'EXECUTE',
  'COPY',
  'VACUUM',
  'ANALYZE',
  'COMMENT',
  'DO',
  'SET',
  'RESET',
  'DISCARD',
] as const

const INCOMPLETE_ENDINGS = [
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'INNER JOIN',
  'CROSS JOIN',
  'ON',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'UNION',
  'INTERSECT',
  'EXCEPT',
  'WITH',
  'AS',
] as const

type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeSql(sql: string): string {
  return sql
    .replace(/\r\n/g, '\n')
    .replace(/^\s+|\s+$/g, '')
    .trim()
}

function stripSqlComments(sql: string): string {
  // Remove -- line comments
  let cleaned = sql.replace(/--.*$/gm, '')

  // Remove /* block comments */
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '')

  return cleaned.trim()
}

/**
 * Critical production fix
 * Strips string literals and quoted identifiers so we don't false-positive
 * on words like "UPDATE" or "DROP" inside string values.
 */
function stripStringLiterals(sql: string): string {
  return sql
    .replace(/'([^'\\]|\\.)*'/g, "''")    // remove single-quoted strings
    .replace(/"([^"\\]|\\.)*"/g, '""')    // remove double-quoted identifiers
}

function stripTrailingSemicolons(sql: string): string {
  return sql.replace(/;+\s*$/, '').trim()
}

function isCannotAnswer(sql: string): boolean {
  return /^CANNOT_ANSWER:/i.test(sql.trim())
}

function hasMarkdownFences(sql: string): boolean {
  return /```/.test(sql)
}

function hasMultipleStatements(sql: string): boolean {
  const cleaned = stripTrailingSemicolons(stripSqlComments(sql))

  let inSingleQuote = false
  let inDoubleQuote = false
  let parenDepth = 0

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i]
    const next = cleaned[i + 1]

    // Escaped single quote in SQL string literal => ''
    if (inSingleQuote && ch === "'" && next === "'") {
      i++
      continue
    }

    if (!inDoubleQuote && ch === "'") {
      inSingleQuote = !inSingleQuote
      continue
    }

    if (!inSingleQuote && ch === '"') {
      inDoubleQuote = !inDoubleQuote
      continue
    }

    if (inSingleQuote || inDoubleQuote) continue

    if (ch === '(') parenDepth++
    else if (ch === ')') parenDepth--

    // Top-level semicolon means multiple statements
    if (ch === ';' && parenDepth === 0) {
      return true
    }
  }

  return false
}

function startsWithAllowedReadQuery(sql: string): boolean {
  const upper = stripSqlComments(sql).trim().toUpperCase()
  return upper.startsWith('SELECT ') || upper.startsWith('WITH ')
}

function containsBlockedKeyword(sql: string): string | null {
  const cleaned = stripStringLiterals(stripSqlComments(sql))
  const upper = cleaned.toUpperCase()

  for (const keyword of BLOCKED_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i')
    if (regex.test(upper)) {
      return keyword
    }
  }

  return null
}

function hasBalancedParenthesesAndQuotes(sql: string): boolean {
  let depth = 0
  let inSingleQuote = false
  let inDoubleQuote = false

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]
    const next = sql[i + 1]

    // Escaped single quote in SQL => ''
    if (inSingleQuote && ch === "'" && next === "'") {
      i++
      continue
    }

    if (!inDoubleQuote && ch === "'") {
      inSingleQuote = !inSingleQuote
      continue
    }

    if (!inSingleQuote && ch === '"') {
      inDoubleQuote = !inDoubleQuote
      continue
    }

    if (inSingleQuote || inDoubleQuote) continue

    if (ch === '(') depth++
    else if (ch === ')') depth--

    if (depth < 0) return false
  }

  return depth === 0 && !inSingleQuote && !inDoubleQuote
}

function hasSelectProjection(sql: string): boolean {
  const cleaned = stripSqlComments(sql).trim()
  const upper = cleaned.toUpperCase()

  if (upper.startsWith('SELECT')) {
    const afterSelect = cleaned.slice('SELECT'.length).trim()
    return afterSelect.length > 0
  }

  // WITH queries are allowed for read-only SQL.
  if (upper.startsWith('WITH ')) {
    return true
  }

  return false
}

function looksIncomplete(sql: string): boolean {
  const cleaned = stripTrailingSemicolons(stripSqlComments(sql))
  const upper = cleaned.toUpperCase()

  if (upper === 'SELECT' || upper === 'WITH') {
    return true
  }

  return INCOMPLETE_ENDINGS.some((ending) => upper.endsWith(ending))
}

// ─── Core Validator ───────────────────────────────────────────────────────────
export function validateSql(sql: string): ValidationResult {
  const normalized = normalizeSql(sql)

  if (!normalized) {
    return { ok: false, reason: 'Generated SQL is empty.' }
  }

  if (isCannotAnswer(normalized)) {
    return { ok: false, reason: normalized }
  }

  if (hasMarkdownFences(normalized)) {
    return { ok: false, reason: 'Generated SQL still contains markdown fences.' }
  }

  if (hasMultipleStatements(normalized)) {
    return { ok: false, reason: 'Multiple SQL statements are not allowed.' }
  }

  if (!startsWithAllowedReadQuery(normalized)) {
    return { ok: false, reason: 'Only read-only SELECT queries are allowed.' }
  }

  const blockedKeyword = containsBlockedKeyword(normalized)
  if (blockedKeyword) {
    return {
      ok: false,
      reason: `Blocked keyword detected: ${blockedKeyword}. Only read-only SELECT queries are allowed.`,
    }
  }

  if (!hasBalancedParenthesesAndQuotes(normalized)) {
    return { ok: false, reason: 'SQL has unbalanced parentheses or quotes.' }
  }

  if (!hasSelectProjection(normalized)) {
    return { ok: false, reason: 'SQL appears malformed or incomplete.' }
  }

  if (looksIncomplete(normalized)) {
    return { ok: false, reason: 'SQL appears truncated or incomplete.' }
  }

  return { ok: true }
}

// ─── validateSQL Node (Production version) ───────────────────────────────────
export async function validateSQLNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log('[validateSQL] Running SQL validation...')
  const sql = state.currentSql ?? ''
  const result = validateSql(sql)

  if (!result.ok) {
    const reason = result.reason
    console.warn(`[validateSQL] Blocked SQL: ${reason}`)

    return {
      isBlocked: true,
      blockedReason: reason,
    }
  }

  console.log('[validateSQL] SQL validation passed ✅')

  return {
    isBlocked: false,
    blockedReason: '',
  }
}

// ─── Test Exports ─────────────────────────────────────────────────────────────
export const __test__ = {
  normalizeSql,
  stripSqlComments,
  stripStringLiterals,
  stripTrailingSemicolons,
  isCannotAnswer,
  hasMarkdownFences,
  hasMultipleStatements,
  startsWithAllowedReadQuery,
  containsBlockedKeyword,
  hasBalancedParenthesesAndQuotes,
  hasSelectProjection,
  looksIncomplete,
  validateSql,
}