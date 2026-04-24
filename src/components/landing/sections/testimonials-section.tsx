import { Reveal, SectionLabel } from '@/components/landing/ui'

const proofOutcomes = [
  ['Query bottleneck', 'Non-technical teammates ask in plain English while analysts can inspect the SQL.'],
  ['Broken SQL risk', 'Self-healing attempts stay visible, so a correction is evidence instead of magic.'],
  ['Compliance review', 'Audit logs, masking, and self-hosted deployment create a trail for security teams.'],
] as const

export function TestimonialsSection() {
  return (
    <section className="scroll-mt-28 bg-[#FCFAF5] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="grid gap-8 xl:grid-cols-[0.58fr_1.42fr] xl:items-start">
          <div className="max-w-2xl xl:max-w-none">
            <SectionLabel>PROOF INSTEAD OF QUOTES</SectionLabel>
            <h2 className="mt-3 max-w-[36rem] text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#313852]">
              Built for the questions teams actually ask.
            </h2>
            <p className="mt-4 max-w-[38rem] text-base leading-7 text-[#5F6475] sm:text-lg sm:leading-8">
              Datavue helps operators, analysts, and security teams answer business questions without losing the SQL, audit trail, or review context.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {proofOutcomes.map(([title, text]) => (
              <article key={title} className="flex h-full flex-col rounded-[1.5rem] border border-[#C2CBD4] bg-[#F7F4EB] p-5 transition duration-500 hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-[#313852]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5F6475]">{text}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
