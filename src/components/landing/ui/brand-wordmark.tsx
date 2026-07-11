import Link from 'next/link'

type BrandWordmarkProps = {
  href?: string
  textClassName?: string
}

export function BrandWordmark({ href = '#top', textClassName = 'font-display text-[18px] text-[#313852]' }: BrandWordmarkProps) {
  return (
    <Link href={href} className="flex items-center gap-3">
      <span className="h-2.5 w-2.5 rounded-full bg-[#5849F2]" />
      <span className={textClassName}>DatavueX</span>
    </Link>
  )
}
