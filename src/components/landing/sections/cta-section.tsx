import Link from 'next/link'
import { Reveal } from '@/components/landing/ui'

export function CtaSection() {
  return (
    <section className="bg-[#F7F4EB] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-6 text-center shadow-[0_18px_60px_rgba(49,56,82,0.05)] sm:p-10">
          <h2 className="mx-auto max-w-3xl font-display text-4xl tracking-[-0.05em] text-[#313852] sm:text-[52px]">
            Start with a database you can safely inspect.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#7B7E8F]">
            Connect a read-only replica, ask one question, and review the SQL, masking, and audit record before your team depends on it.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
