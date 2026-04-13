import type { ReactNode } from 'react'

export function IconShell({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#C2CBD4] bg-[#EDEAFF] text-[#5849F2]">
      {children}
    </span>
  )
}
