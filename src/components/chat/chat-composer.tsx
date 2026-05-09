'use client'

import { useState } from 'react'

type ChatComposerProps = {
  onSend: (query: string) => void
  disabled: boolean
}

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    if (!value.trim() || disabled) return
    onSend(value)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-[#C2CBD4] bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask a question about your data..."
          aria-label="Chat message input"
          rows={1}
          className="min-h-[48px] max-h-[160px] flex-1 resize-none rounded-[16px] border border-[#C2CBD4] bg-white px-4 py-3 text-[15px] leading-[1.75] text-[#313852] placeholder:text-[#7B7E8F] outline-none transition-colors focus:border-[#5849F2] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex h-[48px] items-center gap-2 rounded-full bg-[#5849F2] px-5 text-[15px] font-semibold text-white shadow-[0_14px_30px_rgba(88,73,242,0.28)] transition duration-200 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  )
}
