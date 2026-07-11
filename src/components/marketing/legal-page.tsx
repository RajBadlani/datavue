import { FooterSection } from '@/components/landing/sections'
import { MarketingHeader } from './marketing-header'

export type LegalSection = {
  id: string
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

type LegalPageProps = {
  label: string
  title: string
  effectiveDate: string
  intro: string
  sections: LegalSection[]
}

export function LegalPage({ label, title, effectiveDate, intro, sections }: LegalPageProps) {
  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#F7F4EB] text-[#313852]">
      <MarketingHeader />

      <section className="scroll-mt-28 px-6 pb-20 pt-16 sm:pt-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5849F2]">{label}</p>
          <h1 className="mt-4 font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[0.98] tracking-[-0.05em]">
            {title}
          </h1>
          <p className="mt-4 text-sm text-[#7B7E8F]">Effective date: {effectiveDate}</p>
          <p className="mt-5 text-lg leading-8 text-[#7B7E8F]">{intro}</p>

          <div className="mt-8 rounded-[1.5rem] border border-[#E5E0D4] bg-[#EDEAFF] px-6 py-5">
            <p className="text-[15px] leading-7 text-[#313852]">
              This document is a template written for the DatavueX product. It is not legal advice. Have qualified
              counsel review and adapt it for your jurisdiction and business before you rely on it in production.
            </p>
          </div>

          <nav aria-label="Contents" className="mt-8 rounded-[1.5rem] border border-[#C2CBD4] bg-[#FCFAF5] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5849F2]">Contents</p>
            <ol className="mt-4 space-y-2 text-[15px] text-[#4E556D]">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="underline-link transition-colors hover:text-[#313852]"
                  >
                    {index + 1}. {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-12 space-y-12">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold leading-tight tracking-[-0.02em] text-[#313852]">
                  {index + 1}. {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph, pIndex) => (
                  <p key={pIndex} className="mt-4 text-[15px] leading-8 text-[#7B7E8F]">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-3">
                    {section.bullets.map((bullet, bIndex) => (
                      <li key={bIndex} className="flex gap-3 text-[15px] leading-7 text-[#7B7E8F]">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5849F2]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
