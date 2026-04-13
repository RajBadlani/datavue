import Link from 'next/link'
import { navLinks } from '@/components/landing/constants/content'
import { CloseIcon } from '@/components/landing/icons/landing-icons'
import { BrandWordmark } from '@/components/landing/ui'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-[#313852]/25 lg:hidden" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-[86%] max-w-sm flex-col bg-[#F7F4EB] p-6 shadow-[0_24px_80px_rgba(49,56,82,0.18)]"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <BrandWordmark href="#top" textClassName="font-display text-lg text-[#313852]" />
          <button type="button" className="rounded-full border border-[#C2CBD4] p-2 text-[#313852]" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-4">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} onClick={onClose} className="rounded-2xl border border-[#C2CBD4] bg-white px-4 py-3 text-base font-medium text-[#313852]">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-8">
          <Link href="/sign-in" onClick={onClose} className="block w-full rounded-full border border-[#313852] px-5 py-3 text-center font-semibold text-[#313852]">Sign in</Link>
          <Link href="/sign-up" onClick={onClose} className="block w-full rounded-full bg-[#5849F2] px-5 py-3 text-center font-semibold text-[#FCFAF5]">Start with a database</Link>
        </div>
      </aside>
    </div>
  )
}
