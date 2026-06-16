'use client'

import { useEffect, useRef } from 'react'
import { StatusPill } from '@/components/audit/status-pill'
import { parseSqlAttempts, type AuditLogItem } from '@/components/audit/types'

type AuditDetailDrawerProps = {
  item: AuditLogItem | null
  onClose: () => void
  /** Optional deep-link action, e.g. "Open in chat". */
  onOpenInChat?: (item: AuditLogItem) => void
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#F0EBE1] py-3 last:border-none">
      <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#7B7E8F]">{label}</span>
      <span className="max-w-[62%] text-right text-[13px] text-[#313852]">{children}</span>
    </div>
  )
}

export function AuditDetailDrawer({ item, onClose, onOpenInChat }: AuditDetailDrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!item) return

    // Remember what was focused before the dialog opened so we can restore it
    // on close (WCAG AA: focus must return to the trigger, not document start).
    const previouslyFocused = document.activeElement as HTMLElement | null

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap: keep Tab / Shift+Tab inside the aria-modal dialog.
      if (event.key === 'Tab') {
        const panel = panelRef.current
        if (!panel) return

        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter(element => element.offsetParent !== null)

        if (focusable.length === 0) {
          event.preventDefault()
          panel.focus()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement

        if (event.shiftKey && (active === first || active === panel)) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    panelRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [item, onClose])

  if (!item) return null

  const attempts = parseSqlAttempts(item.sqlAttempts)

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-[#313852]/35" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Query detail"
        onClick={event => event.stopPropagation()}
        className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-[#C2CBD4] bg-[#FCFAF5] shadow-[0_20px_60px_rgba(49,56,82,0.18)] outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E0D4] bg-white px-6 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B7E8F]">Query detail</p>
            <h2 className="mt-2 text-[18px] font-semibold leading-tight text-[#313852]">{item.nlQuery}</h2>
          </div>
          <button
            type="button"
            aria-label="Close detail"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C2CBD4] text-[#7B7E8F] transition-colors hover:bg-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="rounded-[16px] border border-[#E5E0D4] bg-white px-4">
            <Row label="Status"><StatusPill status={item.status} /></Row>
            <Row label="Connection">{item.connectionLabel}</Row>
            <Row label="Run at">{formatTimestamp(item.createdAt)}</Row>
            <Row label="Duration">{item.executionMs != null ? `${item.executionMs} ms` : '—'}</Row>
            <Row label="Rows">{item.rowCount != null ? item.rowCount.toLocaleString() : '—'}</Row>
            <Row label="Chart">{item.chartType ?? '—'}</Row>
            <Row label="Attempts">{attempts.length || 1}</Row>
          </div>

          {item.maskedColumns.length > 0 ? (
            <div className="mt-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7B7E8F]">Masked columns</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.maskedColumns.map(column => (
                  <span key={column} className="inline-flex items-center gap-1.5 rounded-full border border-[#D8D2FF] bg-[#EDEAFF] px-2.5 py-1 text-[12px] font-medium text-[#5849F2]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
                    </svg>
                    {column}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {item.errorMessage ? (
            <div className="mt-5 rounded-[12px] border border-[#F5B6B0] bg-[#FFF1EF] px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#9F2F25]">Error</p>
              <p className="mt-2 font-mono text-[13px] leading-6 text-[#9F2F25]">{item.errorMessage}</p>
            </div>
          ) : null}

          <div className="mt-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7B7E8F]">
              SQL {attempts.length > 1 ? `attempts (${attempts.length})` : ''}
            </p>
            <div className="mt-2 space-y-3">
              {attempts.length > 0 ? (
                attempts.map((attempt, index) => (
                  <div key={`${attempt.attempt}-${index}`} className="overflow-hidden rounded-[12px] border border-[#E5E0D4] bg-white">
                    <div className="flex items-center justify-between border-b border-[#E5E0D4] bg-[#F7F4EB] px-3 py-2">
                      <span className="text-[12px] font-semibold text-[#313852]">Attempt {attempt.attempt || index + 1}</span>
                      {attempt.error ? (
                        <span className="text-[11px] font-medium text-[#9F2F25]">Failed</span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#1C6B3C]">Ran</span>
                      )}
                    </div>
                    <pre className="overflow-x-auto px-3 py-3 font-mono text-[12px] leading-6 text-[#313852]">{attempt.sql}</pre>
                    {attempt.error ? (
                      <p className="border-t border-[#E5E0D4] bg-[#FFF1EF] px-3 py-2 font-mono text-[12px] leading-5 text-[#9F2F25]">{attempt.error}</p>
                    ) : null}
                  </div>
                ))
              ) : item.finalSql ? (
                <pre className="overflow-x-auto rounded-[12px] border border-[#E5E0D4] bg-white px-3 py-3 font-mono text-[12px] leading-6 text-[#313852]">{item.finalSql}</pre>
              ) : (
                <p className="text-[13px] text-[#7B7E8F]">No SQL was generated for this query.</p>
              )}
            </div>
          </div>
        </div>

        {onOpenInChat ? (
          <div className="border-t border-[#E5E0D4] bg-white px-6 py-4">
            <button
              type="button"
              onClick={() => onOpenInChat(item)}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#5849F2] px-5 text-sm font-semibold text-[#FCFAF5] transition-colors hover:bg-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2"
            >
              Open in chat
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
