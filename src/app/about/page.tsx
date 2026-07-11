import type { Metadata } from 'next'
import Link from 'next/link'
import { FooterSection } from '@/components/landing/sections'
import { MarketingHeader } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'About — DatavueX',
  description: 'Why DatavueX exists: trustworthy, auditable database intelligence for teams of mixed data fluency.',
}

// TODO: edit this copy and the numbers below to match your real story.
const VALUES = [
  {
    title: 'Trust is the interface',
    description:
      'Every answer shows the SQL that ran, what was masked, and what was blocked. No black boxes over production data.',
  },
  {
    title: 'Make complexity legible',
    description:
      'Schema details, retries, and metrics stay explainable, so non-technical teammates feel protected and analysts keep their controls.',
  },
  {
    title: 'Respect data boundaries',
    description:
      'Self-hosting, credential encryption, and no-egress expectations are defaults, not afterthoughts.',
  },
]

const STATS = [
  { value: '99.2%', label: 'Recovered query success' },
  { value: '<90s', label: 'To first connected database' },
  { value: '4', label: 'Core database engines' },
]

const TEAM = [
  { name: 'Raj Badlani', role: 'Founder & Engineering', initials: 'RB' },
]

export default function AboutPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#F7F4EB] text-[#313852]">
      <MarketingHeader />

      <section className="scroll-mt-28 px-6 pb-16 pt-16 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5849F2]">About</p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[0.98] tracking-[-0.05em]">
              Database intelligence that a team can actually defend.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#7B7E8F]">
              DatavueX closes the gap between people with data questions and people who can write safe queries. We
              translate plain-English questions into read-only SQL, self-heal failed attempts, mask sensitive fields,
              and keep an audit trail of everything that ran.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
          {STATS.map(stat => (
            <div key={stat.label} className="rounded-[1.75rem] border border-[#C2CBD4] bg-[#FCFAF5] p-6">
              <p className="font-display text-[40px] leading-none tracking-[-0.04em] text-[#313852]">{stat.value}</p>
              <p className="mt-3 text-sm text-[#7B7E8F]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5849F2]">Our story</p>
              <h2 className="mt-4 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
                Built for the wait between a question and an answer.
              </h2>
            </div>
            <div className="space-y-5 text-[15px] leading-8 text-[#7B7E8F]">
              <p>
                A product manager asks one important question and waits three days for an analyst to write the query. A
                single JOIN error silently returns bad numbers, and decisions get made on top of them. We kept seeing
                the same pattern, so we built DatavueX to make trustworthy answers immediate without hiding what ran.
              </p>
              <p>
                Instead of another dashboard, DatavueX behaves like a calm expert sitting beside you: transparent about
                SQL, serious about credentials, and helpful across mixed technical fluency. Replace this paragraph with
                your own origin story, milestones, and what you&apos;re building next.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5849F2]">What we value</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {VALUES.map(value => (
              <div key={value.title} className="rounded-[2rem] border border-[#C2CBD4] bg-white p-7">
                <h3 className="text-[16px] font-semibold leading-tight text-[#313852]">{value.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#7B7E8F]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5849F2]">Team</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map(member => (
              <div key={member.name} className="flex items-center gap-4 rounded-[1.75rem] border border-[#C2CBD4] bg-[#FCFAF5] p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EDEAFF] text-sm font-semibold text-[#5849F2]">
                  {member.initials}
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[#313852]">{member.name}</p>
                  <p className="mt-1 text-sm text-[#7B7E8F]">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-8 text-center shadow-[0_18px_60px_rgba(49,56,82,0.06)] sm:p-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(88,73,242,0.18)_0%,rgba(237,234,255,0.12)_50%,rgba(252,250,245,0)_72%)]" />
            <h2 className="relative mx-auto max-w-2xl text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-[#313852]">
              Want to talk through your use case?
            </h2>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cursor-pointer rounded-full bg-[#5849F2] px-7 py-3.5 text-base font-semibold text-[#FCFAF5] shadow-[0_18px_40px_rgba(88,73,242,0.22)] transition duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFAF5]"
              >
                Contact us
              </Link>
              <Link
                href="/sign-up"
                className="cursor-pointer rounded-full border border-[#313852] px-7 py-3.5 text-base font-semibold text-[#313852] transition duration-200 hover:bg-[#313852] hover:text-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFAF5]"
              >
                Start with a database
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
