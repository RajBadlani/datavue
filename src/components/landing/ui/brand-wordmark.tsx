import Image from 'next/image'
import Link from 'next/link'

type BrandWordmarkProps = {
  href?: string
  textClassName?: string
}

export function BrandWordmark({ href = '#top', textClassName = 'font-display text-[18px] text-[#313852]' }: BrandWordmarkProps) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <Image src="/datavuex-logo.svg" alt="DatavueX" width={28} height={28} className="h-7 w-7" />
      <span className={textClassName}>DatavueX</span>
    </Link>
  )
}
