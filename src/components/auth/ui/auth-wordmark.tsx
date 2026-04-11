import Link from 'next/link'

type AuthWordmarkProps = {
  centered?: boolean
}

export function AuthWordmark({ centered = false }: AuthWordmarkProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 ${centered ? 'justify-center' : 'justify-start'}`}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E6E1FF]">
        <span className="h-3 w-3 rounded-full bg-[#5849F2]" />
      </span>
      <span className="font-display text-[22px] tracking-[-0.04em] text-[#313852]">Datavue</span>
    </Link>
  )
}
