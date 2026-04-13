import type { ReactNode } from 'react'

export function IntegrationLogoShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F4EB] text-[#2E436E]">
      {children}
    </div>
  )
}
