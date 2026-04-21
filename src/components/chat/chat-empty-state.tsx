type ChatEmptyStateProps = {
  onSelectQuery: (query: string) => void
  queries?: string[]
}

const DEFAULT_QUERIES = [
  'Show me top 10 customers by revenue',
  'What are the most popular products this month?',
  'Compare sales by region for the last quarter',
  'How many new users signed up each week?',
]

export function ChatEmptyState({ onSelectQuery, queries = DEFAULT_QUERIES }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDEAFF]">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M14 3.5C8.201 3.5 3.5 8.201 3.5 14c0 2.1.617 4.055 1.68 5.695L3.5 24.5l4.805-1.68A10.45 10.45 0 0014 24.5c5.799 0 10.5-4.701 10.5-10.5S19.799 3.5 14 3.5z" stroke="#5849F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 12.5h8M10 15.5h5" stroke="#5849F2" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-[16px] font-medium text-[#313852]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Ask anything about your data
        </h2>
        <p className="mt-2 text-[14px] leading-[1.6] text-[#7B7E8F]">
          I&apos;ll generate SQL, run it safely, and explain the results. Try one of these:
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {queries.map(query => (
            <button
              key={query}
              type="button"
              onClick={() => onSelectQuery(query)}
              className="rounded-full border border-[#E5E0D4] bg-white px-4 py-2 text-[13px] text-[#313852] transition-colors hover:border-[#5849F2] hover:bg-[#EDEAFF] hover:text-[#5849F2] focus:outline-none focus:ring-2 focus:ring-[#5849F2] focus:ring-offset-2"
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
