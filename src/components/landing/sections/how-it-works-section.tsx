import type { MutableRefObject } from 'react'
import { steps } from '@/components/landing/constants/content'
import { NumberTicker, Reveal, SectionLabel } from '@/components/landing/ui'

function HowItWorksPanel({ activeStep }: { activeStep: number }) {
  if (activeStep === 0) {
    return (
      <div className="space-y-5 rounded-[1.5rem] border border-[#C2CBD4] bg-white p-4 shadow-[0_24px_80px_rgba(49,56,82,0.08)] sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-[#C2CBD4] bg-[#F7F4EB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#313852]">Connect a data source</p>
            <p className="text-sm text-[#7B7E8F]">Read-only schema sync starts instantly</p>
          </div>
          <span className="rounded-full border border-[#B6E2C4] bg-[#E4F0E8] px-3 py-1 text-xs font-semibold text-[#1C6B3C]">
            Connected
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['Postgres', 'MySQL', 'SQLite', 'MongoDB'].map(item => (
            <div key={item} className="rounded-2xl border border-[#C2CBD4] bg-white px-4 py-5 text-center text-sm font-medium text-[#313852]">
              {item}
            </div>
          ))}
        </div>
        <div className="grid gap-2 rounded-2xl bg-[#313852] p-4 font-mono text-xs text-[#F7F4EB] sm:grid-cols-2 sm:text-sm">
          <span>postgres</span>
          <span>readonly user</span>
          <span>analytics replica</span>
          <span>read-only</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#F7F4EB] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7B7E8F]">schemas indexed</p>
            <NumberTicker value={42} className="mt-3 block text-3xl font-semibold text-[#313852]" />
          </div>
          <div className="rounded-2xl bg-[#F7F4EB] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7B7E8F]">tables mapped</p>
            <NumberTicker value={186} className="mt-3 block text-3xl font-semibold text-[#313852]" />
          </div>
          <div className="rounded-2xl bg-[#F7F4EB] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7B7E8F]">sync time</p>
            <NumberTicker value={87} suffix="s" className="mt-3 block text-3xl font-semibold text-[#313852]" />
          </div>
        </div>
      </div>
    )
  }

  if (activeStep === 1) {
    return (
      <div className="space-y-5 rounded-[1.5rem] border border-[#C2CBD4] bg-white p-4 shadow-[0_24px_80px_rgba(49,56,82,0.08)] sm:rounded-[2rem] sm:p-6">
        <div className="rounded-3xl border border-[#C2CBD4] bg-[#F7F4EB] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7B7E8F]">Ask Datavue</p>
          <p className="mt-3 text-lg text-[#313852]">Show me expansion revenue from enterprise accounts by quarter</p>
        </div>
        <div className="overflow-x-auto rounded-3xl border border-[#D6DDF3] bg-[#EDEAFF] p-5 font-mono text-sm leading-7 text-[#313852]">
          SELECT quarter, SUM(expansion_revenue) AS total_expansion<br />
          FROM account_growth<br />
          WHERE segment = &apos;enterprise&apos;<br />
          GROUP BY quarter ORDER BY quarter;
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#C2CBD4] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7B7E8F]">schema confidence</p>
            <NumberTicker value={98.4} decimals={1} suffix="%" className="mt-3 block text-3xl font-semibold text-[#313852]" />
          </div>
          <div className="rounded-2xl border border-[#C2CBD4] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7B7E8F]">generation time</p>
            <NumberTicker value={142} suffix="ms" className="mt-3 block text-3xl font-semibold text-[#313852]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 rounded-[1.5rem] border border-[#C2CBD4] bg-white p-4 shadow-[0_24px_80px_rgba(49,56,82,0.08)] sm:rounded-[2rem] sm:p-6">
      <div className="rounded-3xl border border-[#C2CBD4] bg-[#F7F4EB] p-5">
        <div className="flex items-center justify-between border-b border-[#C2CBD4] pb-3 text-sm font-medium text-[#313852]">
          <span>Result table</span>
          <span className="rounded-full bg-[#EDEAFF] px-3 py-1 text-xs text-[#5849F2]">Live</span>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          {[
            ['Product B', '$318K', '+23%'],
            ['Product A', '$280K', '+9%'],
            ['Product C', '$224K', '+5%'],
          ].map(([product, revenue, change]) => (
            <div key={product} className="grid grid-cols-[1fr_auto] gap-2 rounded-2xl bg-white px-4 py-3 text-[#313852] sm:grid-cols-[1.2fr_1fr_auto] sm:items-center">
              <span>{product}</span>
              <span>{revenue}</span>
              <span className="col-span-2 text-[#1C6B3C] sm:col-span-1">{change}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-[#D6DDF3] bg-[#EDEAFF] p-5 text-[#313852]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5849F2]">Proactive insight</p>
        <p className="mt-3 text-base font-medium">23% spike in Product B revenue in March. Possible seasonal pattern detected.</p>
        <p className="mt-2 text-sm text-[#5F6475]">Datavue found the same pattern in March last year and flagged it without a manual prompt.</p>
      </div>
    </div>
  )
}

type HowItWorksSectionProps = {
  activeStep: number
  stepRefs: MutableRefObject<Array<HTMLDivElement | null>>
}

export function HowItWorksSection({ activeStep, stepRefs }: HowItWorksSectionProps) {
  return (
    <section className="bg-[#F7F4EB] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <SectionLabel>HOW DATAVUE WORKS</SectionLabel>
          <h2 className="mt-4 max-w-xl font-display text-4xl tracking-[-0.05em] text-[#313852] sm:text-5xl">
            From question to insight. No SQL required.
          </h2>
          <div className="mt-10 space-y-4 sm:mt-12 sm:space-y-10">
            {steps.map((step, index) => (
              <div
                key={step.id}
                ref={node => {
                  stepRefs.current[index] = node
                }}
                data-step-index={index}
                className="relative rounded-[1.5rem] border border-[#E5E0D4] bg-[#FCFAF5] p-5 sm:border-0 sm:bg-transparent sm:p-0 sm:pl-12"
              >
                {index < steps.length - 1 ? (
                  <span className="absolute left-[17px] top-10 hidden h-[calc(100%+1.75rem)] w-px bg-[#C2CBD4] sm:block" />
                ) : null}
                <span className={`mb-4 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 sm:absolute sm:left-0 sm:top-0 sm:mb-0 ${
                  activeStep === index
                    ? 'border-[#5849F2] bg-[#5849F2] text-white'
                    : 'border-[#C2CBD4] bg-white text-[#7B7E8F]'
                }`}>
                  {index + 1}
                </span>
                <Reveal>
                  <p className="text-sm font-medium text-[#5849F2]">{step.detail}</p>
              <h3 className="mt-3 text-2xl font-semibold text-[#313852]">{step.title}</h3>
                  <p className="mt-3 max-w-xl text-base leading-7 text-[#7B7E8F]">{step.description}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <HowItWorksPanel activeStep={activeStep} />
        </div>
      </div>
    </section>
  )
}
