'use client'

import { useState } from 'react'

type ChatSqlBlockProps = {
  sql: string
  attempt?: number | null
}

export function ChatSqlBlock({ sql, attempt }: ChatSqlBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sql)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API may not be available
    }
  }

  return (
    <div className="mt-3 overflow-hidden rounded-[16px] border border-[#E5E0D4] bg-[#F3EEE3]">
      <div className="flex items-center justify-between border-b border-[#E5E0D4] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#313852]">Generated SQL</span>
          {attempt && attempt > 1 ? (
            <span className="rounded-full bg-[#EDEAFF] px-2 py-0.5 text-[11px] font-medium text-[#5849F2]">
              Attempt {attempt}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy SQL'}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium text-[#7B7E8F] transition-colors hover:bg-white hover:text-[#313852]"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[14px] leading-[1.75] text-[#313852]" style={{ fontFamily: 'Fira Code, monospace' }}>
        <code>{sql}</code>
      </pre>
    </div>
  )
}
