import { integrations, orchestration } from '@/components/landing/constants/content'
import { Reveal } from '@/components/landing/ui'

export function IntegrationsSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5849F2]">Compatibility</p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-[-0.04em] text-[#313852] sm:text-4xl">
                Connect the databases and tooling already in the review path.
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-[#313852]">Databases</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {integrations.map(item => (
                    <span key={item.name} className="rounded-full border border-[#C2CBD4] bg-[#F7F4EB] px-4 py-2 text-sm font-medium text-[#313852]">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#313852]">Workflow</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {orchestration.map(item => (
                    <span key={item} className="rounded-full border border-[#E5E0D4] bg-[#F7F4EB] px-4 py-2 text-sm font-medium text-[#5F6475]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
