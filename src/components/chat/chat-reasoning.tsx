'use client'

import { useState } from 'react'

type ChatReasoningProps = {
  reasoning: string[]
  isStreaming: boolean
}

export function ChatReasoning({ reasoning, isStreaming }: ChatReasoningProps) {
  const [isOpen, setIsOpen] = useState(isStreaming)

  if (reasoning.length === 0) return null

  return (
    <div className="mt-3 rounded-[12px] border border-[#E5E0D4] bg-[#FCFAF5]">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] font-medium text-[#7B7E8F] transition-colors hover:text-[#313852]"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
        >
          <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Agent Reasoning</span>
        <span className="rounded-full bg-[#EDEAFF] px-1.5 py-0.5 text-[10px] font-semibold text-[#5849F2]">
          {reasoning.length}
        </span>
      </button>
      {isOpen ? (
        <div className="border-t border-[#E5E0D4] px-4 py-3">
          <ul className="space-y-1.5">
            {reasoning.map((item, i) => (
              <li key={i} className="text-[13px] leading-[1.6] text-[#7B7E8F]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
