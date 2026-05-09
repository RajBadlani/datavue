'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChatMessage as ChatMessageType, StreamStatus } from './use-chat-stream'
import { ChatMessage } from './chat-message'
import { ChatStatusIndicator } from './chat-status-indicator'

type ChatThreadProps = {
  messages: ChatMessageType[]
  streamStatus: StreamStatus
  agentStep: string
}

export function ChatThread({ messages, streamStatus, agentStep }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollFab, setShowScrollFab] = useState(false)
  const isAutoScrolling = useRef(true)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAutoScrolling.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, agentStep])

  function handleScroll() {
    const container = containerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    isAutoScrolling.current = isNearBottom
    setShowScrollFab(!isNearBottom && streamStatus === 'streaming')
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    isAutoScrolling.current = true
    setShowScrollFab(false)
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} streamStatus={streamStatus} />
        ))}

        {/* Streaming indicator */}
        {streamStatus === 'streaming' && agentStep ? (
          <ChatStatusIndicator step={agentStep} />
        ) : null}

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom FAB */}
      {showScrollFab ? (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          className="fixed bottom-24 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#C2CBD4] bg-white shadow-[0_8px_24px_rgba(49,56,82,0.12)] transition-colors hover:bg-[#F7F4EB] lg:bottom-20 lg:right-10"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="#313852" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
