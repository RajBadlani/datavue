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
      <Image src="/logo-mark.svg" alt="DatavueX" width={32} height={32} className="h-8 w-8" />
      <span className="font-display text-[22px] tracking-[-0.04em] text-[#313852]">DatavueX</span>
    </Link>
  )
}
