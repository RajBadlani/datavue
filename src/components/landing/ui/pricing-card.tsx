import Link from 'next/link'
import { Reveal } from '@/components/landing/ui/reveal'

type PricingCardProps = {
  title: string
  price: string
  originalPrice?: string
  description: string
  features: string[]
  buttonLabel: string
  buttonHref?: string
  featured?: boolean
}

export function PricingCard({ title, price, originalPrice, description, features, buttonLabel, buttonHref, featured = false }: PricingCardProps) {
  const ButtonTag = buttonHref ? Link : 'button'
  const buttonProps = buttonHref ? { href: buttonHref } : { type: 'button' as const }

  return (
    <Reveal>
      <article className={`group relative h-full rounded-[2rem] p-7 shadow-[0_18px_60px_rgba(49,56,82,0.05)] transition duration-500 hover:-translate-y-1 ${featured ? 'border-2 border-[#5849F2] bg-[#FCFAF5]' : 'border border-[#C2CBD4] bg-[#FCFAF5]'}`}>
        {featured ? <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#EDEAFF] px-3 py-1 text-xs font-semibold text-[#5849F2]">Recommended path</span> : null}
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#5849F2]">{title}</p>
        <div className="mt-5 flex items-baseline gap-3">
          {originalPrice ? <span className="font-display text-2xl tracking-[-0.03em] text-[#7B7E8F] line-through">{originalPrice}</span> : null}
          <p className="font-display text-5xl tracking-[-0.05em] text-[#313852]">{price}</p>
        </div>
        <p className="mt-4 text-sm leading-7 text-[#7B7E8F]">{description}</p>
        <ul className="mt-6 space-y-3 text-sm text-[#313852]">
          {features.map(item => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#5849F2]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {/* @ts-expect-error - polymorphic component */}
        <ButtonTag {...buttonProps} className={`mt-8 block w-full cursor-pointer rounded-full px-5 py-3 text-center font-semibold transition ${featured ? 'bg-[#5849F2] text-[#FCFAF5] shadow-[0_14px_30px_rgba(88,73,242,0.22)] hover:brightness-105' : 'border border-[#313852] text-[#313852] hover:bg-[#313852] hover:text-[#F7F4EB]'}`}>
          {buttonLabel}
        </ButtonTag>
      </article>
    </Reveal>
  )
}
