import Link from 'next/link'
import { HeroAnimator, Reveal, SectionLabel } from '@/components/landing/ui'

type HeroSectionProps = {
  onOpenDemo: () => void
}

export function HeroSection({ onOpenDemo }: HeroSectionProps) {
  return (
    <section id="top" className="relative -mt-20 overflow-hidden bg-[#F7F4EB] pb-20 pt-32 sm:pb-28 sm:pt-40 lg:pb-32 lg:pt-44">
      <div className="hero-dot-pattern absolute inset-0 opacity-[0.055]" />
      <div className="pointer-events-none absolute left-[-18rem] top-16 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(216,210,255,0.72)_0%,rgba(237,234,255,0.28)_46%,rgba(247,244,235,0)_72%)]" />
      <div className="pointer-events-none absolute right-[-18rem] top-36 h-[50rem] w-[50rem] rounded-full bg-[radial-gradient(circle,rgba(88,73,242,0.16)_0%,rgba(237,234,255,0.2)_38%,rgba(247,244,235,0)_70%)]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <Reveal className="space-y-7 sm:space-y-8">
          <div className="max-w-3xl space-y-5">
            <SectionLabel>DATABASE INTELLIGENCE YOU CAN AUDIT</SectionLabel>
            <h1 className="max-w-3xl text-[clamp(3rem,6vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#313852]">
              Ask your database. Get answers you can verify.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#5F6475] sm:text-xl sm:leading-9">
              Datavue turns natural-language questions into read-only SQL, repairs failed attempts, masks sensitive fields, and saves the trail behind every answer.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up" className="cursor-pointer rounded-full bg-[#5849F2] px-7 py-4 text-center text-base font-semibold text-[#FCFAF5] shadow-[0_18px_40px_rgba(88,73,242,0.26)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EB]">
              Start with a database
            </Link>
            <button
              type="button"
              onClick={onOpenDemo}
              className="cursor-pointer rounded-full border border-[#313852] bg-[#FCFAF5]/70 px-7 py-4 text-base font-semibold text-[#313852] transition duration-300 hover:-translate-y-0.5 hover:bg-[#313852] hover:text-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EB]"
            >
              Watch the query path
            </button>
          </div>

          <div className="grid max-w-2xl gap-3 text-sm text-[#5F6475] sm:grid-cols-3">
            {['Read-only execution', 'PII masking', 'Full audit trail'].map(item => (
              <div key={item} className="rounded-full border border-[#C2CBD4] bg-[#FCFAF5]/80 px-4 py-2 text-center font-semibold">
                {item}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="relative flex justify-center lg:justify-end lg:translate-y-8">
          <HeroAnimator />
        </Reveal>
      </div>
    </section>
  )
}
