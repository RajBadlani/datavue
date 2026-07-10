import Link from 'next/link'
import { BrandWordmark } from '@/components/landing/ui'

const marketingNav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

export function MarketingHeader() {
  return (
    <header className="sticky top-3 z-50 mx-3 rounded-[1.75rem] border border-[#C2CBD4] bg-[#FCFAF5]/95 shadow-[0_12px_36px_rgba(49,56,82,0.08)] backdrop-blur-sm sm:top-4 sm:mx-4 sm:rounded-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <BrandWordmark href="/" />

        <nav className="hidden items-center gap-6 lg:flex">
          {marketingNav.map(link => (
            <Link
              key={link.label}
              href={link.href}
              className="underline-link text-sm font-medium text-[#4E556D] transition-colors hover:text-[#313852]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden cursor-pointer rounded-full border border-[#313852] px-4 py-2 text-sm font-medium text-[#313852] transition duration-200 hover:bg-[#313852] hover:text-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EB] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="cursor-pointer rounded-full bg-[#5849F2] px-5 py-2.5 text-sm font-semibold text-[#FCFAF5] shadow-[0_14px_30px_rgba(88,73,242,0.22)] transition duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EB]"
          >
            Start with a database
          </Link>
        </div>
      </div>
    </header>
  )
}
