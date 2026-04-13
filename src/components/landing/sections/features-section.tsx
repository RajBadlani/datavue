import { Reveal, SectionLabel } from '@/components/landing/ui'

const securityControls = [
  ['Credential boundary', 'Connection secrets are encrypted before persistence and never returned in plaintext.'],
  ['Query boundary', 'Generated SQL is shaped for read-only execution and inspected before the answer is trusted.'],
  ['Result boundary', 'PII masking protects sensitive fields before results become visible to the team.'],
  ['Review boundary', 'Audit logs keep prompts, SQL attempts, retries, blocked actions, and outcomes traceable.'],
] as const

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <SectionLabel>PRODUCT PROOF</SectionLabel>
            <h2 className="mt-4 max-w-xl font-display text-4xl tracking-[-0.05em] text-[#313852] sm:text-5xl">
              The answer is only useful if the path is inspectable.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#7B7E8F]">
              Datavue is structured around the controls teams ask for during a production data review: credentials, query safety, masking, and audit history.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-4 sm:p-5">
            <div className="grid gap-4">
              {securityControls.map(([label, text], index) => (
                <article key={label} className="grid gap-4 rounded-[1.5rem] border border-[#E5E0D4] bg-[#F7F4EB] p-5 sm:grid-cols-[3rem_1fr]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDEAFF] text-sm font-semibold text-[#5849F2]">{index + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-[#313852]">{label}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#5F6475]">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
