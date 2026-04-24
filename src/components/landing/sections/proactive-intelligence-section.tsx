import { insightFeed } from '@/components/landing/constants/content'
import { Reveal, SectionLabel } from '@/components/landing/ui'

export function ProactiveIntelligenceSection() {
  return (
    <section className="scroll-mt-28 bg-[#F7F4EB] py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 xl:grid-cols-[0.58fr_1.42fr] xl:items-start">
        <Reveal className="max-w-2xl xl:max-w-none">
          <SectionLabel>PROACTIVE INTELLIGENCE</SectionLabel>
          <h2 className="mt-3 max-w-[36rem] text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#313852]">
            Spot important changes before someone asks.
          </h2>
          <p className="mt-4 max-w-[38rem] text-base leading-7 text-[#5F6475] sm:text-lg sm:leading-8">
            Datavue monitors key metrics and surfaces changes with plain-English context, linked queries, and traceable evidence.
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
                <article className="rounded-[1.5rem] border border-[#E5E0D4] bg-[#F7F4EB] p-4 transition duration-500 hover:-translate-y-1">
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
