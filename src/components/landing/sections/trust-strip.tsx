const trustLedger = [
  {
    label: 'Read-only execution',
    proof: 'Generated SQL is constrained to safe, non-destructive database access.',
    artifact: 'SQL mode: SELECT only',
  },
  {
    label: 'Full audit trail',
    proof: 'Prompts, SQL attempts, retries, masking, and final outcomes stay attached.',
    artifact: 'Prompt + SQL + outcome',
  },
  {
    label: 'PII masking',
    proof: 'Sensitive fields are detected and redacted before answers become team-visible.',
    artifact: 'email -> masked',
  },
  {
    label: 'Encrypted credentials',
    proof: 'Connection secrets are encrypted before storage and never returned in plaintext.',
    artifact: 'AES-256-GCM',
  },
  {
    label: 'Self-hosted boundary',
    proof: 'Enterprise deployments can run app, worker, Redis, Postgres, and Ollama inside your network.',
    artifact: 'No data egress',
  },
] as const

export function TrustStrip() {
  return (
    <section className="scroll-mt-28 border-y border-[#C2CBD4] bg-[#FCFAF5] py-20 sm:py-24" aria-labelledby="trust-ledger-title">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 xl:grid-cols-[0.58fr_1.42fr] xl:items-start">
          <div className="max-w-2xl xl:max-w-none">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5849F2]">TRUST LEDGER</p>
            <h2 id="trust-ledger-title" className="mt-3 max-w-[34rem] text-[clamp(2.125rem,3.4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#313852]">
              Every answer comes with proof.
            </h2>
            <p className="mt-4 max-w-[36rem] text-base leading-7 text-[#5F6475] sm:text-lg sm:leading-8">
              Every query path includes read-only execution, masked sensitive fields, encrypted credentials, and a saved audit record.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-[1.75rem] border border-[#C2CBD4] bg-[#F7F4EB] md:grid-cols-5">
            {trustLedger.map(item => (
              <div key={item.label} className="flex min-h-[15rem] flex-col border-b border-[#E5E0D4] px-4 py-5 transition duration-500 hover:bg-[#FCFAF5] last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <p className="font-semibold text-[#313852]">{item.label}</p>
                <p className="mt-3 text-sm leading-6 text-[#5F6475]">{item.proof}</p>
                <span className="mt-auto inline-flex w-fit rounded-full border border-[#C2CBD4] bg-[#FCFAF5] px-3 py-1 text-xs font-semibold text-[#313852]">
                  {item.artifact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
