import { insightFeed } from '@/components/landing/constants/content'
import { Reveal, SectionLabel } from '@/components/landing/ui'

export function ProactiveIntelligenceSection() {
  return (
    <section className="bg-[#F7F4EB] py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <Reveal>
          <SectionLabel>PROACTIVE INTELLIGENCE</SectionLabel>
          <h2 className="mt-4 max-w-xl font-display text-4xl tracking-[-0.05em] text-[#313852] sm:text-5xl">
            Signal appears as a reviewable ledger, not a surprise alert.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#7B7E8F]">
            Monitored metrics let Datavue surface changes your team did not know to ask about, with plain-English context and traceable evidence.
          </p>
        </Reveal>

        <div className="rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E0D4] pb-4">
            <p className="text-sm font-semibold text-[#313852]">Insight feed</p>
            <span className="rounded-full bg-[#EDEAFF] px-3 py-1 text-xs font-semibold text-[#5849F2]">monitored every 24h</span>
          </div>
          <div className="space-y-3">
            {insightFeed.map(item => (
              <Reveal key={item.title}>
                <article className="rounded-[1.5rem] border border-[#E5E0D4] bg-[#F7F4EB] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-base leading-7 text-[#313852]">{item.title}</p>
                    <span className="shrink-0 rounded-full border border-[#C2CBD4] bg-[#FCFAF5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7B7E8F]">{item.time}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#5F6475]">Evidence remains attached to the metric, query, and comparison window.</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
