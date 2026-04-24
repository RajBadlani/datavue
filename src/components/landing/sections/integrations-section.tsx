import { integrations, orchestration } from '@/components/landing/constants/content'
import { Reveal } from '@/components/landing/ui'

export function IntegrationsSection() {
  return (
    <section className="scroll-mt-28 bg-[#F7F4EB] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-5 shadow-[0_18px_60px_rgba(49,56,82,0.05)] sm:p-6 lg:p-7">
          <div className="grid gap-8 xl:grid-cols-[0.58fr_1.42fr] xl:items-start">
            <div className="max-w-2xl xl:max-w-none">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5849F2]">Compatibility</p>
              <h2 className="mt-3 max-w-[36rem] text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#313852]">
                Connect the data stack you already use.
              </h2>
              <p className="mt-4 max-w-[38rem] text-base leading-7 text-[#5F6475] sm:text-lg sm:leading-8">
                Datavue works with your existing databases, ORMs, and analytics workflow without forcing a new stack.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:gap-6">
              <div>
                <p className="text-sm font-semibold text-[#313852]">Databases</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {integrations.map(item => (
                    <span key={item.name} className="rounded-full border border-[#C2CBD4] bg-[#F7F4EB] px-4 py-2 text-sm font-medium text-[#313852]">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#313852]">Workflow</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
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
