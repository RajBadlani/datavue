import Image from 'next/image'
import Link from 'next/link'

type BrandWordmarkProps = {
  href?: string
  textClassName?: string
}

export function BrandWordmark({ href = '#top', textClassName = 'font-display text-[18px] text-[#313852]' }: BrandWordmarkProps) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <Image src="/datavuex-logo.png" alt="DatavueX" width={30} height={30} className="h-[30px] w-[30px] object-contain" priority />
      <span className={textClassName}>DatavueX</span>
    </Link>
  )
}
