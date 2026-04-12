import { siMongodb, siMysql, siPlanetscale, siPostgresql, siSupabase } from 'simple-icons'
import type { DbType } from '@/components/connections/types'

function IconBase({ children, viewBox = '0 0 24 24', className = 'h-4 w-4' }: { children: React.ReactNode; viewBox?: string; className?: string }) {
  return (
    <svg viewBox={viewBox} className={className} fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  )
}

export function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 7l1 12a1 1 0 001 1h6a1 1 0 001-1l1-12" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" strokeLinecap="round" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

export function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M12 16V5" strokeLinecap="round" />
      <path d="M8 9l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" strokeLinecap="round" />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

export function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="8" cy="12" r="3" />
      <path d="M11 12h8M16 12v-2M19 12v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M10 14l4-4" strokeLinecap="round" />
      <path d="M8 16H7a4 4 0 010-8h3" strokeLinecap="round" />
      <path d="M16 8h1a4 4 0 010 8h-3" strokeLinecap="round" />
    </svg>
  )
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
      <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  )
}

export function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M20 12a8 8 0 10-2.3 5.7" strokeLinecap="round" />
      <path d="M20 7v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SpinnerIcon() {
  return <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
}

export function ConnectionDbIcon({ dbType }: { dbType: DbType }) {
  if (dbType === 'postgresql') {
    return <IconBase className="h-7 w-7"><path d={siPostgresql.path} /></IconBase>
  }
  if (dbType === 'mysql') {
    return <IconBase className="h-7 w-7"><path d={siMysql.path} /></IconBase>
  }
  if (dbType === 'mongodb') {
    return <IconBase className="h-7 w-7"><path d={siMongodb.path} /></IconBase>
  }
  if (dbType === 'supabase') {
    return <IconBase className="h-7 w-7"><path d={siSupabase.path} /></IconBase>
  }
  if (dbType === 'planetscale') {
    return <IconBase className="h-7 w-7"><path d={siPlanetscale.path} /></IconBase>
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </svg>
  )
}
