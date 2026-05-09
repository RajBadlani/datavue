'use client'

import { useCallback, useRef, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useChatStream(connectionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<StreamStatus>('idle')
  const [agentStep, setAgentStep] = useState<string>('')
  const abortRef = useRef<AbortController | null>(null)

  const handleSSEEvent = useCallback((event: string, data: Record<string, unknown>) => {
    switch (event) {
      case 'status':
        if (typeof data.message === 'string') {
          setAgentStep(data.message)
        }
        break

      case 'reasoning':
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.turn && typeof data.message === 'string') {
            last.turn.reasoning = [...last.turn.reasoning, data.message]
          }
          return updated
        })
        break

      case 'sql':
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.turn && typeof data.sql === 'string') {
            last.turn.sql = data.sql
            last.turn.sqlAttempt = typeof data.attempt === 'number' ? data.attempt : 1
          }
          return updated
        })
        break

      case 'chart':
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.turn && data.chartConfig && typeof data.chartConfig === 'object') {
            last.turn.chartConfig = data.chartConfig as ChatChartConfig
          }
          return updated
        })
        break

      case 'response':
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.turn && typeof data.text === 'string') {
            last.turn.response = data.text
            last.content = data.text
          }
          return updated
        })
        break

      case 'done':
        setStatus('done')
        setAgentStep('')
        break

      case 'error':
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.turn && typeof data.message === 'string') {
            last.turn.error = data.message
          }
          return updated
        })
        setStatus('error')
        setAgentStep('')
        break
    }
  }, [])

  const sendMessage = useCallback(
    async (query: string) => {
      if (!query.trim()) return

      // Add user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: query.trim(),
        timestamp: new Date().toISOString(),
      }

      // Prepare assistant placeholder
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
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

      setMessages(prev => [...prev, userMsg, assistantMsg])
      setStatus('streaming')
      setAgentStep('Classifying intent...')

      // Abort any existing stream
      if (abortRef.current) {
        abortRef.current.abort()
      }
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(`/api/chat/${connectionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim() }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const errorText = await res.text()
          setMessages(prev => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last.turn) {
              last.turn.error = errorText || 'Request failed'
            }
            return updated
          })
          setStatus('error')
          setAgentStep('')
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          setStatus('error')
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          let currentEvent = ''

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim()
            } else if (line.startsWith('data: ') && currentEvent) {
              const dataStr = line.slice(6)
              try {
                const data = JSON.parse(dataStr) as Record<string, unknown>
                handleSSEEvent(currentEvent, data)
              } catch {
                // skip malformed JSON
              }
              currentEvent = ''
            }
          }
        }

        // Stream finished
        setStatus(prev => (prev === 'streaming' ? 'done' : prev))
        setAgentStep('')
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.turn) {
            last.turn.error = 'Connection lost. Please try again.'
          }
          return updated
        })
        setStatus('error')
        setAgentStep('')
      }
    },
    [connectionId, handleSSEEvent]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setStatus('idle')
    setAgentStep('')
  }, [])

  const loadHistory = useCallback((history: ChatMessage[]) => {
    setMessages(history)
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
