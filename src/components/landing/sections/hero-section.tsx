import Link from 'next/link'
import { HeroAnimator, Reveal, SectionLabel } from '@/components/landing/ui'

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden bg-[#F7F4EB] pb-14 pt-24 sm:pb-16 sm:pt-36">
      <div className="hero-dot-pattern absolute inset-0 opacity-[0.08]" />
      <div className="pointer-events-none absolute right-[-10%] top-28 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(237,234,255,1)_0%,rgba(237,234,255,0.15)_55%,rgba(247,244,235,0)_72%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl gap-10 px-6 sm:gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal className="space-y-7 sm:space-y-8">
          <div className="space-y-5">
            <SectionLabel>DATABASE INTELLIGENCE YOU CAN AUDIT</SectionLabel>
            <h1 className="font-display max-w-3xl text-[42px] leading-[0.96] tracking-[-0.05em] text-[#313852] sm:text-6xl lg:text-[72px]">
              Ask your database. See exactly what ran.
            </h1>
            <p className="max-w-xl text-base leading-7 text-[#7B7E8F] sm:text-xl sm:leading-8">
              Datavue turns plain-English questions into safe read-only queries, heals failed SQL, masks sensitive results, and records every attempt for audit.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/sign-up" className="cursor-pointer rounded-full bg-[#5849F2] px-6 py-3.5 text-center text-base font-semibold text-[#FCFAF5] shadow-[0_18px_40px_rgba(88,73,242,0.24)] transition duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EB]">
              Start with a database
            </Link>
            <a
              href="#self-healing"
              className="cursor-pointer rounded-full border border-[#313852] px-6 py-3.5 text-base font-semibold text-[#313852] transition duration-200 hover:bg-[#313852] hover:text-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EB]"
            >
              See self-healing SQL
            </a>
          </div>

          <p className="max-w-lg text-sm leading-6 text-[#7B7E8F]">No credit card. Connect a read-only database, ask one question, and inspect the SQL before your team depends on it.</p>
        </Reveal>

        <Reveal className="relative flex justify-center lg:justify-end">
          <HeroAnimator />
        </Reveal>
      </div>
    </section>
  )
}
