import { Reveal, SectionLabel } from '@/components/landing/ui'

const auditEvents = [
  ['09:42:11', 'Prompt received', 'User asked for enterprise churn risk after pricing change.'],
  ['09:42:12', 'Attempt failed', 'Column `plan_changed` did not match the synced schema.'],
  ['09:42:12', 'Correction applied', 'Replaced with `pricing_changed` from `enterprise_accounts`.'],
  ['09:42:13', 'Result approved', 'Read-only query succeeded, 1 sensitive column masked.'],
] as const

export function SelfHealingSection() {
  return (
    <section id="self-healing" className="scroll-mt-28 bg-[#F7F4EB] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="max-w-5xl">
          <div>
            <SectionLabel>SELF-HEALING SQL</SectionLabel>
            <h2 className="mt-3 max-w-4xl text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#313852]">
              Every failed query leaves a repair trail.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5F6475] sm:text-lg sm:leading-8">
              Datavue records the failed attempt, detects the schema mismatch, retries safely, and shows the correction path before the answer is trusted.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {['2 attempts', 'schema mismatch fixed', 'audit record saved'].map(item => (
              <span key={item} className="rounded-full border border-[#C2CBD4] bg-[#FCFAF5] px-4 py-2 text-sm font-semibold text-[#313852]">
                {item}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-8 rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-4 shadow-[0_24px_80px_rgba(49,56,82,0.08)] sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
            <div className="grid gap-5">
              <div className="rounded-[1.5rem] border border-[#F1D7D7] bg-[#FFF1EF] p-5 transition duration-500 hover:-translate-y-1 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-[#F5B6B0] px-3 py-1 text-xs font-semibold text-[#9F2F25]">Attempt 1 failed</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9F2F25]">schema mismatch</span>
                </div>
                <pre className="mt-5 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-7 text-[#7A4B4B]">{`SELECT account_id, churn_risk
FROM enterprise_accounts
WHERE plan_changed = true
ORDER BY churn_risk DESC;`}</pre>
                <p className="mt-4 rounded-2xl border border-[#F5B6B0] bg-[#FCFAF5] px-4 py-3 text-sm leading-6 text-[#7A4B4B]">
                  Database response: column `plan_changed` does not exist. Closest schema match is `pricing_changed`.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#CFE7D7] bg-[#F3FBF6] p-5 transition duration-500 hover:-translate-y-1 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-[#E4F0E8] px-3 py-1 text-xs font-semibold text-[#1C6B3C]">Attempt 2 succeeded</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1C6B3C]">read-only retry</span>
                </div>
                <pre className="mt-5 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-7 text-[#1C6B3C]">{`SELECT account_id, churn_risk, owner_email
FROM enterprise_accounts
WHERE pricing_changed = true
ORDER BY churn_risk DESC;`}</pre>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {['2 attempts', '1 masked column', 'audit record saved'].map(item => (
                    <span key={item} className="rounded-2xl border border-[#CFE7D7] bg-[#FCFAF5] px-4 py-3 text-center text-xs font-semibold text-[#313852]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#C2CBD4] bg-[#F7F4EB] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C2CBD4] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7B7E8F]">Audit record</p>
                  <p className="mt-2 text-lg font-semibold text-[#313852]">Query healing timeline</p>
                </div>
                <span className="rounded-full bg-[#EDEAFF] px-3 py-1 text-xs font-semibold text-[#5849F2]">logged</span>
              </div>

              <div className="mt-5 space-y-4">
                {auditEvents.map(([time, title, detail], index) => (
                  <div key={`${time}-${title}`} className="grid grid-cols-[4.75rem_1fr] gap-4">
                    <span className="font-mono text-xs text-[#7B7E8F]">{time}</span>
                    <div className="rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-[#313852]">{title}</p>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EDEAFF] text-xs font-semibold text-[#5849F2]">{index + 1}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#5F6475]">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
