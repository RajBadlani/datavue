'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatChart } from '@/components/chat/chat-chart'
import { ChatReasoning } from '@/components/chat/chat-reasoning'
import { ChatSqlBlock } from '@/components/chat/chat-sql-block'
import { ChatTable } from '@/components/chat/chat-table'
import type { ChatMessage as ChatMessageType, StreamStatus } from '@/components/chat/use-chat-stream'

type ChatMessageProps = {
  message: ChatMessageType
  streamStatus: StreamStatus
}

function formatRelativeTime(timestamp: string) {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`

  return `${Math.floor(diffHr / 24)}d ago`
}

export function ChatMessage({ message, streamStatus }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isStreaming = streamStatus === 'streaming'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-[16px] bg-[#EDEAFF] px-4 py-3 sm:max-w-[70%]">
          <p className="text-[15px] leading-[1.75] text-[#313852]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {message.content}
          </p>
          <p className="mt-1 text-right text-[11px] text-[#7B7E8F]">{formatRelativeTime(message.timestamp)}</p>
        </div>
      </div>
    )
  }

  const turn = message.turn

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] sm:max-w-[80%]">
        {turn?.error ? (
          <div className="mb-3 rounded-[12px] border border-[#F5B6B0] bg-[#FFF1EF] px-4 py-3 text-[14px] text-[#9F2F25]">
            {turn.error}
          </div>
        ) : null}

        {turn?.reasoning && turn.reasoning.length > 0 ? <ChatReasoning reasoning={turn.reasoning} isStreaming={isStreaming} /> : null}
        {turn?.sql ? <ChatSqlBlock sql={turn.sql} attempt={turn.sqlAttempt} /> : null}
        {turn?.queryResult ? <ChatTable result={turn.queryResult} /> : null}
        {turn?.chartConfig && turn.chartConfig.type !== 'none' ? <ChatChart config={turn.chartConfig} data={turn.queryResult} /> : null}

        {turn?.response ? (
          <div className="mt-3 text-[15px] leading-[1.75] text-[#313852]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-')

                  if (isBlock) {
                    return (
                      <pre className="my-2 overflow-x-auto rounded-[12px] bg-[#F3EEE3] p-3 text-[14px]" style={{ fontFamily: 'Fira Code, monospace' }}>
                        <code>{children}</code>
                      </pre>
                    )
                  }

                  return (
                    <code className="rounded bg-[#F3EEE3] px-1.5 py-0.5 text-[13px]" style={{ fontFamily: 'Fira Code, monospace' }}>
                      {children}
                    </code>
                  )
                },
                ul: ({ children }) => <ul className="mb-2 list-disc pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 list-decimal pl-5">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
              }}
            >
              {turn.response}
            </ReactMarkdown>
          </div>
        ) : null}

        {!isStreaming && turn?.response ? <p className="mt-2 text-[11px] text-[#7B7E8F]">{formatRelativeTime(message.timestamp)}</p> : null}
      </div>
    </div>
  )
}
