import { Reveal, SectionLabel } from '@/components/landing/ui'

const proofOutcomes = [
  ['Query bottleneck', 'Non-technical teammates ask in plain English while analysts can inspect the SQL.'],
  ['Broken SQL risk', 'Self-healing attempts stay visible, so a correction is evidence instead of magic.'],
  ['Compliance review', 'Audit logs, masking, and self-hosted deployment create a trail for security teams.'],
] as const

export function TestimonialsSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <SectionLabel>PROOF INSTEAD OF QUOTES</SectionLabel>
            <h2 className="mt-4 max-w-lg font-display text-4xl tracking-[-0.05em] text-[#313852] sm:text-5xl">
              No fictional logos. Just the review path Datavue supports.
            </h2>
          </div>

          <div className="grid gap-4">
            {proofOutcomes.map(([title, text]) => (
              <article key={title} className="rounded-[1.5rem] border border-[#C2CBD4] bg-[#F7F4EB] p-5">
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
