import { Reveal, SectionLabel } from '@/components/landing/ui'

const roleProof = [
  {
    role: 'Founder / operator',
    job: 'Ask revenue, signup, and churn questions without waiting on the analytics queue.',
    proof: 'Sees the generated SQL, masked fields, and saved dashboard path before sharing an answer.',
  },
  {
    role: 'Data analyst',
    job: 'Accelerate routine slices while preserving the ability to inspect and correct the query.',
    proof: 'Reviews schema context, retry history, and final SQL instead of trusting a black box.',
  },
  {
    role: 'IT administrator',
    job: 'Approve data access only when deployment, credential, and audit boundaries are explicit.',
    proof: 'Checks self-hosting, encrypted credentials, no-egress mode, and immutable audit logs.',
  },
] as const

export function PainPointsSection() {
  return (
    <section className="bg-[#FCFAF5] py-20" id="product">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <SectionLabel>WHO TRUSTS THE ANSWER</SectionLabel>
            <h2 className="mt-4 max-w-lg font-display text-4xl tracking-[-0.05em] text-[#313852] sm:text-5xl">
              One answer, different proof for every reviewer.
            </h2>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#C2CBD4] bg-[#F7F4EB]">
            {roleProof.map(item => (
              <article key={item.role} className="grid gap-4 border-b border-[#E5E0D4] p-5 last:border-b-0 md:grid-cols-[0.45fr_1fr] md:p-6">
                <div>
                  <p className="text-lg font-semibold tracking-[-0.02em] text-[#313852]">{item.role}</p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#5849F2]">primary job</p>
                </div>
                <div>
                  <p className="text-base leading-7 text-[#313852]">{item.job}</p>
                  <p className="mt-3 rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] px-4 py-3 text-sm leading-6 text-[#5F6475]">
                    {item.proof}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
