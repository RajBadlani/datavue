'use client'

type SettingsSectionProps = {
  label: string
  title: string
  description?: string
  children: React.ReactNode
  variant?: 'default' | 'danger'
}

export function SettingsSection({ label, title, description, children, variant = 'default' }: SettingsSectionProps) {
  const isDanger = variant === 'danger'

  return (
    <section
      className={`rounded-[24px] border p-8 ${
        isDanger
          ? 'border-[#F5B6B0] bg-[#FFF1EF]'
          : 'border-[#C2CBD4] bg-white'
      }`}
      aria-labelledby={`section-${label}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5849F2]">
        {label}
      </span>
      <h2
        id={`section-${label}`}
        className={`mt-2 text-[20px] font-semibold tracking-[-0.02em] ${
          isDanger ? 'text-[#9F2F25]' : 'text-[#313852]'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-[15px] leading-7 text-[#7B7E8F]">{description}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  )
}
