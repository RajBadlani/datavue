import { Reveal, SectionLabel } from '@/components/landing/ui'

const securityControls = [
  ['Credential boundary', 'Connection secrets are encrypted before persistence and never returned in plaintext.'],
  ['Query boundary', 'Generated SQL is shaped for read-only execution and inspected before the answer is trusted.'],
  ['Result boundary', 'PII masking protects sensitive fields before results become visible to the team.'],
  ['Review boundary', 'Audit logs keep prompts, SQL attempts, retries, blocked actions, and outcomes traceable.'],
] as const

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-28 bg-[#FCFAF5] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="grid gap-8 xl:grid-cols-[0.58fr_1.42fr] xl:items-start">
          <div className="max-w-2xl xl:max-w-none">
            <SectionLabel>SECURITY / MASKING</SectionLabel>
            <h2 className="mt-3 max-w-[40rem] text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#313852]">
              Sensitive data stays protected before answers are shared.
            </h2>
            <p className="mt-4 max-w-[40rem] text-base leading-7 text-[#5F6475] sm:text-lg sm:leading-8">
              Credentials, queries, results, and audit logs are protected at every boundary before answers become visible to the team.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#C2CBD4] bg-[#F7F4EB] p-4 sm:p-5">
            <div className="grid grid-flow-dense gap-4 md:grid-cols-2">
              {securityControls.map(([label, text], index) => (
                <article key={label} className="grid gap-4 rounded-[1.5rem] border border-[#E5E0D4] bg-[#FCFAF5] p-5 transition duration-500 hover:-translate-y-1 sm:grid-cols-[3rem_1fr]">
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
