import { MAX_RETRIES } from '../constants/agent.constants'
import { AgentStateType, SqlAttempt } from '../state'

// ─── Error Classification ─────────────────────────────────────────────────────
function isRetryableSQLError(errorMessage: string): boolean {
  const error = errorMessage.toLowerCase()

  // Non-retryable: infrastructure / auth / environment failures
  const nonRetryablePatterns = [
    'connection refused',
    'could not connect',
    'connection timeout',
    'too many connections',
    'server closed the connection',
    'connection terminated',

    'permission denied',
    'insufficient privilege',
    'must be owner',
    'role does not exist',

    'statement timeout',
    'query_canceled',
    'canceling statement due to',

    'password authentication failed',
    'invalid password',
    'no pg_hba.conf entry',
  ]

  const isNonRetryable = nonRetryablePatterns.some((pattern) =>
    error.includes(pattern)
  )

  return !isNonRetryable
}

function annotateLastAttemptAsNonRetryable(
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
        error: `${errorMessage} (non-retryable — skipping retries)`,
      }
    }

    return attempt
  })
}

// ─── selfHeal Node ────────────────────────────────────────────────────────────
export async function selfHealNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const errorMessage = state.lastError.trim()
  const currentRetry = state.retryCount

  console.log(
    `[selfHeal] Evaluating DB failure | retry=${currentRetry}/${MAX_RETRIES} | error="${errorMessage}"`
  )

  const shouldRetry = isRetryableSQLError(errorMessage)

  if (!shouldRetry) {
    console.warn('[selfHeal] Non-retryable error detected — skipping correction loop')

    return {
      retryCount: MAX_RETRIES,
      sqlAttempts: annotateLastAttemptAsNonRetryable(
        state.sqlAttempts,
        errorMessage
      ),
      queryResult: null,
      isBlocked: false,
      blockedReason: '',
      finalResponse: '',
    }
  }

  const nextRetryCount = currentRetry + 1

  console.log(
    `[selfHeal] Retryable SQL error — scheduling retry ${nextRetryCount}/${MAX_RETRIES}`
  )

  return {
    retryCount: nextRetryCount,
    queryResult: null,
    isBlocked: false,
    blockedReason: '',
    finalResponse: '',
  }
}