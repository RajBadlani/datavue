import { Reveal, SectionLabel } from '@/components/landing/ui'

const boundaryNodes = ['Datavue app', 'Worker', 'Redis', 'Postgres', 'Ollama', 'Your database'] as const

export function EnterpriseSection({ onOpenEnterprise }: { onOpenEnterprise: () => void }) {
  return (
    <section id="security" className="scroll-mt-28 bg-[#313852] py-24 text-[#F7F4EB] sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <Reveal>
          <SectionLabel>PRIVACY BOUNDARY</SectionLabel>
          <h2 className="mt-3 max-w-xl text-[clamp(2.375rem,4vw,3.625rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-[#F7F4EB]">
            Keep private data inside your infrastructure.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#D7D9E2]">
            Enterprise deployments can keep the app, worker, operational database, and local model runtime inside your infrastructure. The product story stays the same; the data boundary changes completely.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {['No data egress', 'Ollama-ready', 'Audit controls'].map(item => (
                <span key={item} className="rounded-full border border-[#7E8498] bg-[#3A4058] px-4 py-2 text-sm font-medium text-[#F7F4EB]">
                {item}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenEnterprise}
            className="mt-8 cursor-pointer rounded-full border border-[#F7F4EB] px-6 py-3 text-base font-semibold text-[#F7F4EB] transition duration-200 hover:bg-[#F7F4EB] hover:text-[#313852] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7F4EB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#313852]"
          >
            Review self-hosting options
          </button>
        </Reveal>

        <Reveal>
          <div className="rounded-[2rem] border border-[#7E8498] bg-[#3A4058] p-5 shadow-[0_24px_80px_rgba(18,23,42,0.24)] sm:p-6">
            <div className="rounded-[1.5rem] border border-dashed border-[#9BA0B0] bg-[#313852] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#5D647D] pb-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D7D9E2]">Your infrastructure</p>
                  <p className="mt-2 text-sm text-[#D7D9E2]">All sensitive processing stays inside this boundary.</p>
                </div>
                <span className="rounded-full bg-[#EDEAFF] px-3 py-1 text-xs font-semibold text-[#5849F2]">self-hosted</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {boundaryNodes.map(item => (
                  <div key={item} className="rounded-2xl border border-[#5D647D] bg-[#3A4058] p-4 text-sm font-semibold text-[#F7F4EB] transition duration-500 hover:-translate-y-1">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-[#7E8498] bg-[#2F354D] p-4 text-sm leading-6 text-[#D7D9E2]">
                Cloud mode can use hosted providers when configured. Self-hosted mode keeps schema, prompts, results, and model calls inside the deployment boundary.
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
