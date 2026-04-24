const auditRows = [
  ['Mode', 'read-only'],
  ['Self-heal', 'column mismatch corrected'],
  ['PII masking', 'email masked before display'],
  ['Audit record', 'prompt, SQL, retry, result logged'],
] as const

const resultRows = [
  ['MRR', '$142K', 'visible'],
  ['owner_email', 'masked: email', 'redacted'],
  ['churn_risk', 'High', 'visible'],
] as const

export function HeroAnimator() {
  return (
    <div className="group w-full max-w-[42rem] rotate-[-1deg] rounded-[1.5rem] border border-[#C2CBD4] bg-[#F3EEE3] p-3 shadow-[0_30px_90px_rgba(49,56,82,0.12)] transition duration-700 hover:rotate-0 sm:rounded-[2rem] sm:p-5">
      <div className="rounded-[1.25rem] border border-[#C2CBD4] bg-[#FCFAF5] p-3 transition-transform duration-700 group-hover:scale-[1.01] sm:rounded-[1.75rem] sm:p-5">
        <div className="flex flex-col gap-3 border-b border-[#E5E0D4] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7B7E8F]">Query receipt</p>
            <p className="mt-2 max-w-md text-base font-medium leading-7 text-[#313852]">
              Which enterprise accounts have rising churn risk after the pricing change?
            </p>
          </div>
          <span className="w-fit rounded-full bg-[#EDEAFF] px-3 py-1 text-xs font-semibold text-[#5849F2]">read-only</span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.78fr]">
          <div className="min-w-0 rounded-2xl border border-[#D9DFE7] bg-[#F7F4EB] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7B7E8F]">Generated SQL</p>
              <span className="rounded-full border border-[#C2CBD4] bg-[#FCFAF5] px-2.5 py-1 text-[11px] font-medium text-[#5F6475]">attempt 2</span>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-6 text-[#313852] sm:text-sm">{`SELECT account_id, churn_risk, owner_email
FROM enterprise_accounts
WHERE pricing_changed = true
ORDER BY churn_risk DESC;`}</pre>
          </div>

          <div className="rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7B7E8F]">Audit trail</p>
            <div className="mt-3 space-y-2">
              {auditRows.map(([label, value]) => (
                <div key={label} className="grid gap-1 text-sm sm:grid-cols-[6.5rem_1fr] sm:gap-3">
                  <span className="text-[#7B7E8F]">{label}</span>
                  <span className="font-medium text-[#313852]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-[#C2CBD4] bg-[#FCFAF5]">
          <div className="grid grid-cols-[1fr_1fr_0.8fr] bg-[#F7F4EB] px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7B7E8F] sm:px-4 sm:text-xs sm:tracking-[0.22em]">
            <span>Field</span>
            <span>Result</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-[#E5E0D4]">
            {resultRows.map(([field, result, status]) => (
              <div key={field} className="grid grid-cols-[1fr_1fr_0.8fr] gap-2 px-3 py-3 text-xs text-[#313852] sm:gap-3 sm:px-4 sm:text-sm">
                <span className="min-w-0 break-words font-mono text-xs">{field}</span>
                <span className="min-w-0 break-words font-medium">{result}</span>
                <span className={status === 'redacted' ? 'font-semibold text-[#9F2F25]' : 'text-[#5F6475]'}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
