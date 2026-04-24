import type { ReactNode } from 'react'
import { CloseIcon } from '@/components/landing/icons/landing-icons'

type ModalShellProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function ModalShell({ open, title, onClose, children }: ModalShellProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#313852]/35 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-6 shadow-[0_24px_80px_rgba(49,56,82,0.18)]" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-3xl tracking-[-0.04em] text-[#313852]">{title}</h3>
          <button type="button" className="rounded-full border border-[#C2CBD4] p-2 text-[#313852]" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
