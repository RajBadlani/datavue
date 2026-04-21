'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatMessage } from '@/components/chat/chat-message'
import { ChatStatusIndicator } from '@/components/chat/chat-status-indicator'
import type { ChatMessage as ChatMessageType, StreamStatus } from '@/components/chat/use-chat-stream'

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
    <div ref={containerRef} onScroll={handleScroll} className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} streamStatus={streamStatus} />
        ))}

        {streamStatus === 'streaming' && agentStep ? <ChatStatusIndicator step={agentStep} /> : null}

        <div ref={bottomRef} />
      </div>

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
