import type { ReactNode } from 'react'

function ShellIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      {children}
    </svg>
  )
}

export function AppLogoMark({ className = 'h-3 w-3' }: { className?: string }) {
  return <span className={`rounded-full bg-[#5849F2] ${className}`} />
}

export function ChevronDownIcon() {
  return (
    <ShellIcon>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </ShellIcon>
  )
}

export function BellIcon() {
  return (
    <ShellIcon>
      <path d="M8 18h8" strokeLinecap="round" />
      <path d="M10 20a2 2 0 004 0" strokeLinecap="round" />
      <path d="M6.5 16.5h11c-.9-1-1.5-2.6-1.5-4.8 0-2.7-1.4-5.2-4-5.7V5a1 1 0 10-2 0v.9c-2.6.5-4 3-4 5.7 0 2.2-.6 3.8-1.5 4.9z" strokeLinejoin="round" />
    </ShellIcon>
  )
}

export function SignOutIcon() {
  return (
    <ShellIcon>
      <path d="M14 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 12H9" strokeLinecap="round" />
      <path d="M10 19H6a2 2 0 01-2-2V7a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
    </ShellIcon>
  )
}

export function SettingsIcon() {
  return (
    <ShellIcon>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 00.2 1.1l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a2 2 0 01-4 0v-.2a1 1 0 00-.6-.9 1 1 0 00-1.1.2l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a2 2 0 010-4h.2a1 1 0 00.9-.6 1 1 0 00-.2-1.1l-.1-.1a2 2 0 012.8-2.8l.1.1a1 1 0 001.1.2 1 1 0 00.6-.9V4a2 2 0 014 0v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a2 2 0 012.8 2.8l-.1.1a1 1 0 00-.2 1.1 1 1 0 00.9.6h.2a2 2 0 010 4h-.2a1 1 0 00-.9.6z" strokeLinejoin="round" />
    </ShellIcon>
  )
}

export function DatabaseIcon() {
  return (
    <ShellIcon>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </ShellIcon>
  )
}

export function HistoryIcon() {
  return (
    <ShellIcon>
      <path d="M4 12a8 8 0 108-8 7.8 7.8 0 00-5.6 2.3" />
      <path d="M4 5v4h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </ShellIcon>
  )
}

export function ShieldIcon() {
  return (
    <ShellIcon>
      <path d="M12 4l7 3v5c0 4.3-3 7.7-7 8-4-.3-7-3.7-7-8V7l7-3z" />
      <path d="M9.5 12.5l1.7 1.7 3.3-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </ShellIcon>
  )
}

export function GridIcon() {
  return (
    <ShellIcon>
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" strokeLinejoin="round" />
    </ShellIcon>
  )
}

export function getShellNavIcon(name: string) {
  switch (name) {
    case 'database':
      return <DatabaseIcon />
    case 'history':
      return <HistoryIcon />
    case 'shield':
      return <ShieldIcon />
    case 'settings':
      return <SettingsIcon />
    default:
      return <GridIcon />
  }
}
