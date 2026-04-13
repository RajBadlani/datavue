import type { ReactNode } from 'react'
import type { LandingIconName } from '@/components/landing/types'

function SvgIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      {children}
    </svg>
  )
}

function BrandSvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden="true">
      {children}
    </svg>
  )
}

export function MenuIcon() {
  return (
    <SvgIcon>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </SvgIcon>
  )
}

export function CloseIcon() {
  return (
    <SvgIcon>
      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
    </SvgIcon>
  )
}

export function LightbulbIcon() {
  return (
    <SvgIcon>
      <path d="M9 18h6" strokeLinecap="round" />
      <path d="M10 22h4" strokeLinecap="round" />
      <path d="M8.5 14.5C7 13.3 6 11.4 6 9.2A6 6 0 0118 9.2c0 2.2-1 4.1-2.5 5.3-.9.7-1.5 1.8-1.5 3H10c0-1.2-.6-2.3-1.5-3z" />
    </SvgIcon>
  )
}

export function AlertTriangleIcon() {
  return (
    <SvgIcon>
      <path d="M12 4l8 14H4L12 4z" />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </SvgIcon>
  )
}

export function TelescopeIcon() {
  return (
    <SvgIcon>
      <path d="M5 19l4-4" strokeLinecap="round" />
      <path d="M14 10l5 9" strokeLinecap="round" />
      <path d="M4 20h8" strokeLinecap="round" />
      <path d="M7 16l6-10 4 2-6 10z" />
    </SvgIcon>
  )
}

export function WandIcon() {
  return (
    <SvgIcon>
      <path d="M4 20L20 4" strokeLinecap="round" />
      <path d="M14 4h3M18.5 8.5V5.5M8 10H5M5.5 13.5v-3" strokeLinecap="round" />
    </SvgIcon>
  )
}

export function SparkChartIcon() {
  return (
    <SvgIcon>
      <path d="M4 18h16" strokeLinecap="round" />
      <path d="M6 15l4-4 3 2 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  )
}

export function SchemaIcon() {
  return (
    <SvgIcon>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="9" y="14" width="6" height="6" rx="1.5" />
      <path d="M10 7h4M12 10v4" strokeLinecap="round" />
    </SvgIcon>
  )
}

export function DatabaseIcon() {
  return (
    <SvgIcon>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </SvgIcon>
  )
}

export function ShieldIcon() {
  return (
    <SvgIcon>
      <path d="M12 4l7 3v5c0 4.3-3 7.7-7 8-4-.3-7-3.7-7-8V7l7-3z" />
      <path d="M9.5 12.5l1.7 1.7 3.3-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  )
}

export function HistoryIcon() {
  return (
    <SvgIcon>
      <path d="M4 12a8 8 0 108-8 7.8 7.8 0 00-5.6 2.3" />
      <path d="M4 5v4h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </SvgIcon>
  )
}

export function NeonLogo() {
  return (
    <BrandSvg>
      <path d="M13 14v20M13 14l22 20M35 14v20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </BrandSvg>
  )
}

export function LandingIcon({ name }: { name: LandingIconName }) {
  switch (name) {
    case 'lightbulb':
      return <LightbulbIcon />
    case 'alertTriangle':
      return <AlertTriangleIcon />
    case 'telescope':
      return <TelescopeIcon />
    case 'wand':
      return <WandIcon />
    case 'sparkChart':
      return <SparkChartIcon />
    case 'schema':
      return <SchemaIcon />
    case 'database':
      return <DatabaseIcon />
    case 'shield':
      return <ShieldIcon />
    case 'history':
      return <HistoryIcon />
  }
}
