import type { Metadata } from 'next'
import Link from 'next/link'
import { FooterSection } from '@/components/landing/sections'
import { ContactForm, MarketingHeader } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'Contact — Datavue',
  description: 'Talk to the Datavue team about connecting databases, self-hosting, and security review.',
}

// TODO: replace these placeholders with your real details.
type ContactChannel = {
  label: string
  value: string
  href?: string | null
  hint: string
}

const CONTACT_CHANNELS: ContactChannel[] = [
  {
    label: 'Phone',
    value: '+91 8209542225',
    hint: 'Mon–Fri, 9:00–18:00 IST',
  },
  {
    label: 'Email',
    value: 'help@datavue.app',
    href: 'mailto:help@datavue.app',
    hint: 'We reply within one business day',
  },
  {
    label: 'Office',
    value: 'India',
    href: null,
    hint: '',
  },
]

export default function ContactPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#F7F4EB] text-[#313852]">
      <MarketingHeader />

      <section className="scroll-mt-28 px-6 pb-20 pt-16 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5849F2]">Contact</p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[0.98] tracking-[-0.05em]">
              Talk to a calm expert about your data.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#7B7E8F]">
              Questions about connecting a database, self-hosting, PII masking, or a security review? Send a note and
              the team will get back to you.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-6 shadow-[0_18px_60px_rgba(49,56,82,0.05)] sm:p-8">
              <h2 className="text-[16px] font-semibold leading-tight text-[#313852]">Send a message</h2>
              <p className="mt-2 text-[15px] leading-7 text-[#7B7E8F]">
                Fill this in and we&apos;ll open your mail client with the details prefilled.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>

            <div className="space-y-4">
              {CONTACT_CHANNELS.map(channel => (
                <div
                  key={channel.label}
                  className="rounded-[1.75rem] border border-[#C2CBD4] bg-white p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5849F2]">{channel.label}</p>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="mt-3 block text-[18px] font-medium text-[#313852] transition-colors hover:text-[#5849F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="mt-3 text-[18px] font-medium text-[#313852]">{channel.value}</p>
                  )}
                  <p className="mt-2 text-sm text-[#7B7E8F]">{channel.hint}</p>
                </div>
              ))}

              <div className="rounded-[1.75rem] border border-[#C2CBD4] bg-[#EDEAFF] p-6">
                <p className="text-[15px] leading-7 text-[#313852]">
                  Prefer to see it live first?{' '}
                  <Link href="/sign-up" className="font-semibold text-[#5849F2] underline-offset-4 hover:underline">
                    Start with a database
                  </Link>{' '}
                  and connect a read-only replica in under 90 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
