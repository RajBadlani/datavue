'use client'

import { useEffect, useState } from 'react'

type DetailData = {
  id: string
  nlQuery: string
  status: string
  sqlAttempts: unknown
  finalSql: string | null
  executionMs: number | null
  rowCount: number | null
  maskedColumns: string[]
  chartType: string | null
  errorMessage: string | null
  createdAt: string
  connection: { id: string; label: string }
}

type HistoryDetailDrawerProps = {
  selectedId: string | null
  onClose: () => void
}

export function HistoryDetailDrawer({ selectedId, onClose }: HistoryDetailDrawerProps) {
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedId) {
      setData(null)
      return
    }
    setLoading(true)
    fetch(`/api/history/${selectedId}`)
      .then(res => res.json())
      .then((d: DetailData) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [selectedId])

  if (!selectedId) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-[#C2CBD4] bg-white shadow-[0_20px_60px_rgba(49,56,82,0.08)]"
        role="dialog"
        aria-label="Query detail"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#C2CBD4] px-6 py-4">
          <h2 className="text-[16px] font-semibold text-[#313852]">Query Detail</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#7B7E8F] hover:bg-[#F7F4EB] hover:text-[#313852]"
            aria-label="Close detail panel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <span className="text-[14px] text-[#7B7E8F]">Loading…</span>
            </div>
          )}

          {!loading && data && (
            <div className="space-y-6">
              {/* NL Query */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5849F2]">
                  Natural Language Query
                </span>
                <p className="mt-2 text-[15px] leading-7 text-[#313852]">{data.nlQuery}</p>
              </div>

              {/* Status & meta */}
              <div className="flex flex-wrap gap-3">
                <span className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                  data.status === 'SUCCESS' ? 'bg-[#EDEAFF] text-[#5849F2]' :
                  data.status === 'FAILED' ? 'bg-[#FFF1EF] text-[#9F2F25]' :
                  'bg-[#F7F4EB] text-[#7B7E8F]'
                }`}>
                  {data.status}
                </span>
                <span className="rounded-full bg-[#EDEAFF] px-3 py-1 text-[12px] font-medium text-[#5849F2]">
                  {data.connection.label}
                </span>
                {data.executionMs != null && (
                  <span className="rounded-full bg-[#F7F4EB] px-3 py-1 text-[12px] text-[#7B7E8F]">
                    {data.executionMs}ms
                  </span>
                )}
                {data.rowCount != null && (
                  <span className="rounded-full bg-[#F7F4EB] px-3 py-1 text-[12px] text-[#7B7E8F]">
                    {data.rowCount} rows
                  </span>
                )}
              </div>

              {/* SQL Attempts */}
              {Array.isArray(data.sqlAttempts) && data.sqlAttempts.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5849F2]">
                    SQL Attempts
                  </span>
                  <div className="mt-2 space-y-2">
                    {(data.sqlAttempts as Array<{ sql?: string; error?: string }>).map((attempt, i) => (
                      <div key={i} className="rounded-[12px] bg-[#F3EEE3] p-4">
                        {attempt.sql && (
                          <pre className="whitespace-pre-wrap text-[14px] leading-[1.75] text-[#313852]" style={{ fontFamily: 'Fira Code, monospace' }}>
                            {attempt.sql}
                          </pre>
                        )}
                        {attempt.error && (
                          <p className="mt-2 text-[13px] text-[#9F2F25]">{attempt.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final SQL */}
              {data.finalSql && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5849F2]">
                      Final SQL
                    </span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(data.finalSql!)}
                      className="text-[12px] font-medium text-[#5849F2] hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="mt-2 rounded-[12px] bg-[#F3EEE3] p-4">
                    <pre className="whitespace-pre-wrap text-[14px] leading-[1.75] text-[#313852]" style={{ fontFamily: 'Fira Code, monospace' }}>
                      {data.finalSql}
                    </pre>
                  </div>
                </div>
              )}

              {/* Error message */}
              {data.errorMessage && (
                <div className="rounded-[12px] border border-[#F5B6B0] bg-[#FFF1EF] p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9F2F25]">
                    Error
                  </span>
                  <p className="mt-1 text-[14px] text-[#9F2F25]">{data.errorMessage}</p>
                </div>
              )}

              {/* Masked columns */}
              {data.maskedColumns.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5849F2]">
                    Masked Columns
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.maskedColumns.map(col => (
                      <span key={col} className="rounded-full bg-[#EDEAFF] px-3 py-1 text-[12px] font-medium text-[#5849F2]">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Re-run button */}
              <div className="border-t border-[#C2CBD4] pt-4">
                <a
                  href={`/chat/${data.connection.id}?query=${encodeURIComponent(data.nlQuery)}`}
                  className="inline-flex h-11 items-center rounded-full bg-[#5849F2] px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Re-run in chat
                </a>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
