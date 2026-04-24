import type { ReactNode } from 'react'

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`motion-safe:animate-[fade-up_700ms_cubic-bezier(0.22,1,0.36,1)_both] ${className}`}>
      {children}
    </div>
  )
}
