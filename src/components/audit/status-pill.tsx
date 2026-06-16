import type { QueryStatus } from '@/generated/prisma/enums'
import { STATUS_META, type StatusMeta } from '@/components/audit/types'

function StatusGlyph({ icon }: { icon: StatusMeta['icon'] }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
      {icon === 'check' ? <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {icon === 'x' ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {icon === 'shield' ? (
        <>
          <path d="M12 3l7 3v5c0 4.3-3 7.7-7 8-4-.3-7-3.7-7-8V6l7-3z" strokeLinejoin="round" />
          <path d="M9 12h6" strokeLinecap="round" />
        </>
      ) : null}
      {icon === 'clock' ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
    </svg>
  )
}

export function StatusPill({ status }: { status: QueryStatus }) {
  const meta = STATUS_META[status]

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: meta.bg, borderColor: meta.border, color: meta.text }}
    >
      <StatusGlyph icon={meta.icon} />
      {meta.label}
    </span>
  )
}
