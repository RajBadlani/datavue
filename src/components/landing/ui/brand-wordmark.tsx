import Image from 'next/image'
import Link from 'next/link'

type BrandWordmarkProps = {
  href?: string
  textClassName?: string
}

export function BrandWordmark({ href = '#top', textClassName = 'font-display text-[18px] text-[#313852]' }: BrandWordmarkProps) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <Image src="/logo-mark.svg" alt="DatavueX" width={24} height={24} className="h-6 w-6" />
      <span className={textClassName}>DatavueX</span>
    </Link>
  )
}
