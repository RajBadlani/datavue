'use client'

import { useEffect, useCallback } from 'react'
import { useChatStream, type ChatMessage } from './use-chat-stream'
import { ChatHeader } from './chat-header'
import { ChatThread } from './chat-thread'
import { ChatComposer } from './chat-composer'
import { ChatEmptyState } from './chat-empty-state'

type ConnectionMeta = {
  id: string
  label: string
  dbType: string
  syncStatus: string
}

type ChatViewProps = {
  connectionId: string
  connection: ConnectionMeta
  initialMessages: ChatMessage[]
}

export function ChatView({ connectionId, connection, initialMessages }: ChatViewProps) {
  const { messages, status, agentStep, sendMessage, clearMessages, loadHistory } = useChatStream(connectionId)

  // Load initial history on mount
  useEffect(() => {
    if (initialMessages.length > 0) {
      loadHistory(initialMessages)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewConversation = useCallback(() => {
    clearMessages()
  }, [clearMessages])

  const handleSend = useCallback(
    (query: string) => {
      sendMessage(query)
    },
    [sendMessage]
  )

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // ⌘K or Ctrl+K — focus composer
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const textarea = document.querySelector<HTMLTextAreaElement>('[aria-label="Chat message input"]')
        textarea?.focus()
      }
      // ⌘⇧C — clear conversation
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        handleNewConversation()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleNewConversation])

  const isStreaming = status === 'streaming'
  const hasMessages = messages.length > 0

  return (
    <div className="flex h-[calc(100vh-3.5rem-env(safe-area-inset-top))] flex-col lg:h-[calc(100vh-3.5rem)]">
      <ChatHeader
        connectionName={connection.label}
        syncStatus={connection.syncStatus}
        dbType={connection.dbType}
        onNewConversation={handleNewConversation}
      />

      {hasMessages ? (
        <ChatThread messages={messages} streamStatus={status} agentStep={agentStep} />
      ) : (
        <ChatEmptyState onSelectQuery={handleSend} />
      )}

      <ChatComposer onSend={handleSend} disabled={isStreaming} />
    </div>
  )
}
