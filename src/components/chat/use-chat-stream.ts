'use client'

import { useCallback, useRef, useState } from 'react'

export type StreamStatus = 'idle' | 'streaming' | 'done' | 'error'

export interface ChatChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table' | 'metric_card' | 'none'
  xKey?: string
  yKey?: string
  series?: string[]
  xLabel?: string
  yLabel?: string
  color?: string
  title?: string
  isTruncated?: boolean
  value?: string
  label?: string
}

export interface ChatQueryResult {
  rows: Record<string, unknown>[]
  rowCount: number
  returnedRowCount: number
  fields: string[]
  isTruncated: boolean
}

export interface AssistantTurn {
  reasoning: string[]
  sql: string | null
  sqlAttempt: number | null
  chartConfig: ChatChartConfig | null
  queryResult: ChatQueryResult | null
  response: string
  error: string | null
  isBlocked: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  turn?: AssistantTurn
}

function createLocalId(prefix: string) {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
}

function normalizeStatusMessage(message: string) {
  const lowered = message.toLowerCase()

  if (lowered.includes('classifying intent')) return 'Reading connection context'
  if (lowered.includes('intent:')) return lowered.includes('general') ? 'Preparing answer' : 'Planning query'
  if (lowered.includes('schema loaded')) return 'Reading connection schema'
  if (lowered.includes('executing query')) return 'Executing read-only query'
  if (lowered.includes('query returned')) return 'Query finished'
  if (lowered.includes('query blocked')) return 'Validating query safety'
  if (lowered.includes('correcting sql')) return 'Retrying with synced schema'
  if (lowered.includes('complete')) return 'Answer ready'
  return message
}

function parseEventChunk(chunk: string) {
  const lines = chunk.split(/\r?\n/)
  let event = 'message'
  const dataParts: string[] = []

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    }

    if (line.startsWith('data:')) {
      dataParts.push(line.slice(5).trim())
    }
  }

  const rawData = dataParts.join('\n')
  if (!rawData) return null

  try {
    return {
      event,
      data: JSON.parse(rawData) as Record<string, unknown>,
    }
  } catch {
    return {
      event,
      data: { message: decodeHtmlEntities(rawData) },
    }
  }
}

async function getErrorMessage(response: Response) {
  const text = await response.text()

  if (!text.trim()) {
    return 'The request failed.'
  }

  try {
    const payload = JSON.parse(text) as { error?: { message?: unknown } }
    if (typeof payload.error?.message === 'string' && payload.error.message.trim()) {
      return payload.error.message
    }
  } catch {
    // Fall back to the plain response text.
  }

  return text
}

export function useChatStream(connectionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<StreamStatus>('idle')
  const [agentStep, setAgentStep] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const updateLastAssistantTurn = useCallback((updater: (turn: AssistantTurn) => AssistantTurn) => {
    setMessages(current => {
      const lastMessage = current[current.length - 1]
      if (!lastMessage?.turn) return current

      const nextTurn = updater(lastMessage.turn)
      const nextMessages = [...current]
      nextMessages[nextMessages.length - 1] = {
        ...lastMessage,
        content: nextTurn.response || lastMessage.content,
        turn: nextTurn,
      }

      return nextMessages
    })
  }, [])

  const handleSseEvent = useCallback((event: string, data: Record<string, unknown>) => {
    switch (event) {
      case 'status': {
        if (typeof data.message === 'string') {
          setAgentStep(normalizeStatusMessage(data.message))
        }
        break
      }
      case 'reasoning': {
        if (typeof data.message !== 'string') break

        const message = normalizeStatusMessage(data.message)

        updateLastAssistantTurn(turn => ({
          ...turn,
          reasoning: [...turn.reasoning, message],
        }))
        break
      }
      case 'sql': {
        if (typeof data.sql !== 'string') break

        const sql = data.sql
        const sqlAttempt = typeof data.attempt === 'number' ? data.attempt : null

        updateLastAssistantTurn(turn => ({
          ...turn,
          sql,
          sqlAttempt: sqlAttempt ?? turn.sqlAttempt ?? 1,
        }))
        break
      }
      case 'results': {
        if (!data.queryResult || typeof data.queryResult !== 'object') break

        updateLastAssistantTurn(turn => ({
          ...turn,
          queryResult: data.queryResult as ChatQueryResult,
        }))
        break
      }
      case 'chart': {
        if (!data.chartConfig || typeof data.chartConfig !== 'object') break

        updateLastAssistantTurn(turn => ({
          ...turn,
          chartConfig: data.chartConfig as ChatChartConfig,
        }))
        break
      }
      case 'response': {
        if (typeof data.text !== 'string') break

        const response = data.text

        updateLastAssistantTurn(turn => ({
          ...turn,
          response,
        }))
        break
      }
      case 'done': {
        setStatus('done')
        setAgentStep('')
        break
      }
      case 'error': {
        if (typeof data.message === 'string') {
          const errorMessage = data.message

          updateLastAssistantTurn(turn => ({
            ...turn,
            error: errorMessage,
          }))
        }

        setStatus('error')
        setAgentStep('')
        break
      }
      default:
        break
    }
  }, [updateLastAssistantTurn])

  const sendMessage = useCallback(async (query: string) => {
    if (!connectionId || !query.trim()) return

    const userMessage: ChatMessage = {
      id: createLocalId('user'),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
    }

    const assistantMessage: ChatMessage = {
      id: createLocalId('assistant'),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      turn: {
        reasoning: [],
        sql: null,
        sqlAttempt: null,
        chartConfig: null,
        queryResult: null,
        response: '',
        error: null,
        isBlocked: false,
      },
    }

    setMessages(current => [...current, userMessage, assistantMessage])
    setStatus('streaming')
    setAgentStep('Reading connection context')

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch(`/api/chat/${encodeURIComponent(connectionId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response)

        updateLastAssistantTurn(turn => ({
          ...turn,
          error: errorMessage,
        }))

        setStatus('error')
        setAgentStep('')
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        updateLastAssistantTurn(turn => ({
          ...turn,
          error: 'The response stream was empty.',
        }))
        setStatus('error')
        setAgentStep('')
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() ?? ''

        for (const chunk of chunks) {
          const parsed = parseEventChunk(chunk)
          if (!parsed) continue

          handleSseEvent(parsed.event, parsed.data)
        }
      }

      setStatus(current => (current === 'streaming' ? 'done' : current))
      setAgentStep('')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      updateLastAssistantTurn(turn => ({
        ...turn,
        error: 'Connection lost. Please try again.',
      }))
      setStatus('error')
      setAgentStep('')
    }
  }, [connectionId, handleSseEvent, updateLastAssistantTurn])

  const clearMessages = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([])
    setStatus('idle')
    setAgentStep('')
  }, [])

  const loadHistory = useCallback((history: ChatMessage[]) => {
    setMessages(history)
    setStatus('idle')
    setAgentStep('')
  }, [])

  return {
    messages,
    status,
    agentStep,
    sendMessage,
    clearMessages,
    loadHistory,
  }
}
