'use client'

import { useEffect } from 'react'
import { ChatComposer } from '@/components/chat/chat-composer'
import { ChatEmptyState } from '@/components/chat/chat-empty-state'
import { ChatHeader } from '@/components/chat/chat-header'
import { ChatThread } from '@/components/chat/chat-thread'
import {
  useChatStream,
  type ChatMessage,
  type ChatChartConfig,
  type ChatQueryResult,
} from '@/components/chat/use-chat-stream'

type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'

export type StoredConversationMessage = {
  role: 'user' | 'assistant'
  content: string
  sql?: string
  timestamp: string
  reasoning?: string[]
  sqlAttempt?: number
  chartConfig?: ChatChartConfig | null
  queryResult?: ChatQueryResult | null
}

type ChatConnection = {
  id: string
  label: string
  dbType: string
  syncStatus: SyncStatus
  schemaPreview: string[]
}

type ConnectionChatPageProps = {
  connection: ChatConnection | null
  initialMessages: StoredConversationMessage[]
}

type StreamProblem = {
  kind: 'connection-not-found' | 'schema-not-synced'
  title: string
  description: string
}

function getDbLabel(dbType: string) {
  if (dbType === 'POSTGRES') return 'PostgreSQL'
  if (dbType === 'MYSQL') return 'MySQL'
  if (dbType === 'MONGODB') return 'MongoDB'
  if (dbType === 'SQLITE') return 'SQLite'
  return dbType
}

function getSuggestedPrompts(connection: ChatConnection) {
  const tableName = connection.schemaPreview[0]

  return [
    tableName ? `Explain the schema of ${tableName}` : 'Explain the schema of this database',
    'How many tables are present in this database?',
    tableName ? `What are the key columns and joins around ${tableName}?` : 'Which tables are most useful for analysis first?',
  ]
}

function toChatHistory(messages: StoredConversationMessage[]): ChatMessage[] {
  return messages.map((message, index) => ({
    id: `history-${index}`,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    ...(message.role === 'assistant'
      ? {
          turn: {
            reasoning: message.reasoning ?? [],
            sql: message.sql ?? null,
            sqlAttempt: message.sqlAttempt ?? null,
            chartConfig: message.chartConfig ?? null,
            queryResult: message.queryResult ?? null,
            response: message.content,
            error: null,
            isBlocked: false,
          },
        }
      : {}),
  }))
}

function StatusBlock({ problem }: { problem: StreamProblem }) {
  return (
    <section className="rounded-[24px] border border-[#E5E0D4] bg-[#FCFAF5] p-5" aria-live="polite">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7B7E8F]">Chat status</p>
      <h2 className="mt-3 text-[22px] font-semibold leading-tight text-[#313852]">{problem.title}</h2>
      <p className="mt-2 text-sm leading-7 text-[#7B7E8F]">{problem.description}</p>
    </section>
  )
}

export function ConnectionChatPage({ connection, initialMessages }: ConnectionChatPageProps) {
  const { messages, status, agentStep, sendMessage, clearMessages, loadHistory } = useChatStream(connection?.id ?? null)

  useEffect(() => {
    loadHistory(toChatHistory(initialMessages))
  }, [initialMessages, loadHistory])

  if (!connection) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <StatusBlock
            problem={{
              kind: 'connection-not-found',
              title: 'This connection could not be opened',
              description: 'The requested connection was not found or is no longer available to your account. Return to connections and choose another data source.',
            }}
          />
        </div>
      </div>
    )
  }

  const canChat = connection.syncStatus === 'SYNCED'
  const isStreaming = status === 'streaming'

  return (
    <div className="flex h-[calc(100vh-9.25rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col lg:h-[calc(100vh-3.5rem)]">
      <ChatHeader
        connectionName={connection.label}
        syncStatus={connection.syncStatus}
        dbType={getDbLabel(connection.dbType)}
        onNewConversation={clearMessages}
      />

      {canChat ? (
        messages.length > 0 ? (
          <ChatThread messages={messages} streamStatus={status} agentStep={agentStep} />
        ) : (
          <ChatEmptyState onSelectQuery={sendMessage} queries={getSuggestedPrompts(connection)} />
        )
      ) : (
        <div className="flex flex-1 items-center px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <StatusBlock
              problem={{
                kind: 'schema-not-synced',
                title: connection.syncStatus === 'FAILED' ? 'Metadata sync needs attention' : 'Schema context is still preparing',
                description:
                  connection.syncStatus === 'FAILED'
                    ? 'Datavue cannot start chat for this connection until metadata sync succeeds. Return to connections and rerun the sync first.'
                    : 'Datavue only answers after the saved schema finishes syncing. Return to connections and wait for this source to become ready.',
              }}
            />
          </div>
        </div>
      )}

      <ChatComposer
        onSend={sendMessage}
        disabled={!canChat || isStreaming}
        placeholder={canChat ? 'Ask a question about your data...' : 'Chat becomes available after schema sync completes'}
      />
    </div>
  )
}
