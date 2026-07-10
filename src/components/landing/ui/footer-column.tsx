import Link from 'next/link'

export type FooterLink = { label: string; href: string }

export function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#5849F2]">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-[#7B7E8F]">
        {links.map(link => (
          <li key={link.label}>
            <Link href={link.href} className="underline-link transition-colors hover:text-[#313852]">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
