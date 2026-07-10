type SocialBadgeProps = {
  label: string
  href?: string
}

const baseClass =
  'inline-flex rounded-full border border-[#C2CBD4] px-3 py-2 text-sm font-medium transition-colors hover:border-[#5849F2] hover:text-[#5849F2]'

export function SocialBadge({ label, href }: SocialBadgeProps) {
  if (!href) {
    return <span className={baseClass}>{label}</span>
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={baseClass}>
      {label}
    </a>
  )
}
