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
    <section className="scroll-mt-28 bg-[#FCFAF5] py-20 sm:py-28" id="product">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="grid gap-8 xl:grid-cols-[0.58fr_1.42fr] xl:items-start">
          <div className="max-w-2xl xl:max-w-none">
            <SectionLabel>WHO TRUSTS THE ANSWER</SectionLabel>
            <h2 className="mt-3 max-w-[36rem] text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#313852]">
              One answer, three ways to verify it.
            </h2>
            <p className="mt-4 max-w-[38rem] text-base leading-7 text-[#5F6475] sm:text-lg sm:leading-8">
              Founders see the business result, analysts inspect the SQL path, and admins control the security boundary.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {roleProof.map(item => (
              <article key={item.role} className="flex h-full flex-col rounded-[1.75rem] border border-[#C2CBD4] bg-[#F7F4EB] p-5 transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(49,56,82,0.06)] md:p-6">
                <div>
                  <p className="text-lg font-semibold tracking-[-0.02em] text-[#313852]">{item.role}</p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#5849F2]">review need</p>
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="mt-5 text-base leading-7 text-[#313852]">{item.job}</p>
                  <p className="mt-auto rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] px-4 py-3 text-sm leading-6 text-[#5F6475]">
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
