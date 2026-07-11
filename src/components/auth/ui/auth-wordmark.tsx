import Image from 'next/image'
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
      <Image src="/datavuex-logo.png" alt="DatavueX" width={36} height={36} className="h-9 w-9 rounded-lg" />
      <span className="font-display text-[22px] tracking-[-0.04em] text-[#313852]">DatavueX</span>
    </Link>
  )
}
