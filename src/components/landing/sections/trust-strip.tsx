const trustLedger = [
  {
    label: 'Read-only execution',
    proof: 'Datavue is designed around safe query generation and non-destructive database access.',
    artifact: 'SQL mode: SELECT only',
  },
  {
    label: 'Full audit trail',
    proof: 'Every prompt, generated SQL attempt, retry, masked column, and result state is recorded.',
    artifact: 'Prompt + SQL + outcome',
  },
  {
    label: 'PII masking',
    proof: 'Sensitive fields are detected and redacted before answers become team-visible.',
    artifact: 'email -> masked',
  },
  {
    label: 'Encrypted credentials',
    proof: 'Connection secrets are encrypted before persistence and never shown back in plaintext.',
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
    <section className="border-y border-[#C2CBD4] bg-[#FCFAF5] py-10" aria-labelledby="trust-ledger-title">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5849F2]">Trust ledger</p>
            <h2 id="trust-ledger-title" className="mt-3 max-w-sm text-2xl font-semibold tracking-[-0.03em] text-[#313852] sm:text-3xl">
              The proof security reviewers ask for first.
            </h2>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-[#C2CBD4] bg-[#F7F4EB]">
            {trustLedger.map(item => (
              <div key={item.label} className="grid gap-3 border-b border-[#E5E0D4] px-4 py-4 last:border-b-0 sm:grid-cols-[0.75fr_1.25fr_auto] sm:items-center sm:px-5">
                <p className="font-semibold text-[#313852]">{item.label}</p>
                <p className="text-sm leading-6 text-[#5F6475]">{item.proof}</p>
                <span className="w-fit rounded-full border border-[#C2CBD4] bg-[#FCFAF5] px-3 py-1 text-xs font-semibold text-[#313852]">
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
