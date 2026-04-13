import type { ReactNode } from 'react'

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5849F2]">{children}</p>
}
