'use client'

export function HistoryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDEAFF]">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path
            d="M14 3.5C8.201 3.5 3.5 8.201 3.5 14S8.201 24.5 14 24.5 24.5 19.799 24.5 14 19.799 3.5 14 3.5z"
            stroke="#5849F2"
            strokeWidth="1.5"
          />
          <path d="M14 8v6l4 2" stroke="#5849F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="text-[16px] font-medium text-[#313852]">No queries yet</h3>
      <p className="mt-2 max-w-xs text-[14px] leading-[1.6] text-[#7B7E8F]">
        Once you start asking questions about your data, your query history will appear here.
      </p>
      <a
        href="/connections"
        className="mt-6 inline-flex h-11 items-center rounded-full border border-[#313852] px-6 text-[15px] font-medium text-[#313852] transition-colors hover:bg-[#313852] hover:text-white"
      >
        Go to connections
      </a>
    </div>
  )
}
