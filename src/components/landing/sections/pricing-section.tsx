import { enterpriseFeatures, faqs, proFeatures, starterFeatures } from '@/components/landing/constants/content'
import { PricingCard, Reveal, SectionLabel } from '@/components/landing/ui'

type PricingSectionProps = {
  annualBilling: boolean
  onChangeAnnualBilling: (value: boolean) => void
  openFaq: number | null
  onToggleFaq: (index: number | null) => void
}

export function PricingSection({ annualBilling, onChangeAnnualBilling, openFaq, onToggleFaq }: PricingSectionProps) {
  const proPrice = annualBilling ? '$39' : '$49'

  return (
    <section id="pricing" className="scroll-mt-28 bg-[#F7F4EB] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <SectionLabel>PRICING</SectionLabel>
          <h2 className="mt-3 max-w-xl text-[clamp(2.375rem,4vw,3.625rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-[#313852]">
            Start small, scale into team analytics.
          </h2>
        </Reveal>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full border border-[#C2CBD4] bg-[#FCFAF5] p-1">
            <button
              type="button"
              onClick={() => onChangeAnnualBilling(false)}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition ${
                !annualBilling ? 'bg-[#313852] text-[#F7F4EB]' : 'text-[#5F6475]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => onChangeAnnualBilling(true)}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition ${
                annualBilling ? 'bg-[#313852] text-[#F7F4EB]' : 'text-[#5F6475]'
              }`}
            >
              Annual <span className="ml-2 rounded-full bg-[#EDEAFF] px-2 py-1 text-xs text-[#5849F2]">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <PricingCard title="Starter" price="Free" description="For solo exploration and first connection." features={starterFeatures} buttonLabel="Start with a database" />
          <PricingCard
            featured
            title="Pro"
            price={`${proPrice}/mo`}
            description="For teams replacing the analytics queue with reliable answers."
            features={proFeatures}
            buttonLabel="Start with a database"
          />
          <PricingCard title="Enterprise" price="Custom" description="For regulated teams and on-prem deployments." features={enterpriseFeatures} buttonLabel="Contact sales" />
        </div>

        <Reveal className="mt-12 rounded-[2rem] border border-[#C2CBD4] bg-[#FCFAF5] p-6">
          <h3 className="text-lg font-semibold text-[#313852]">Common questions about pricing</h3>
          <div className="mt-6 divide-y divide-[#E5E8EE]">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index
              return (
                <div key={item.question} className="py-4">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
                    onClick={() => onToggleFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-medium text-[#313852]">{item.question}</span>
                    <span className="text-[#5849F2]">{isOpen ? '-' : '+'}</span>
                  </button>
                  {isOpen ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[#7B7E8F]">{item.answer}</p> : null}
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
