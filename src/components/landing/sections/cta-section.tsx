import Link from 'next/link'
import { Reveal } from '@/components/landing/ui'

export function CtaSection() {
  return (
    <section className="scroll-mt-28 bg-[#F7F4EB] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-6 text-center shadow-[0_18px_60px_rgba(49,56,82,0.06)] sm:p-12">
          <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(88,73,242,0.18)_0%,rgba(237,234,255,0.12)_50%,rgba(252,250,245,0)_72%)]" />
          <h2 className="relative mx-auto max-w-2xl text-[clamp(2.375rem,4vw,3.625rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-[#313852]">
            Start with a database. Leave with answers you can defend.
          </h2>
          <p className="relative mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#7B7E8F]">
            Connect a read-only replica, ask one question, and review the SQL, masking, and audit record before your team depends on it.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/sign-up" className="cursor-pointer rounded-full bg-[#5849F2] px-7 py-3.5 text-base font-semibold text-[#FCFAF5] shadow-[0_18px_40px_rgba(88,73,242,0.22)] transition duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFAF5]">
              Start with a database
            </Link>
            <a href="#security" className="cursor-pointer rounded-full border border-[#313852] px-7 py-3.5 text-base font-semibold text-[#313852] transition duration-200 hover:bg-[#313852] hover:text-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFAF5]">
              Review self-hosting options
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
