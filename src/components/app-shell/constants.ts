export const appNavItems = [
  { href: '/connections', label: 'Connections', icon: 'database' },
  { href: '/chat', label: 'Chat', icon: 'chat' },
  { href: '/dashboard', label: 'Explorer', icon: 'grid' },
  { href: '/history', label: 'Query History', icon: 'history' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
] as const

export const appPageTitles: Record<string, string> = {
  '/dashboard': 'Explorer',
  '/connections': 'Connections',
  '/chat': 'Chat',
  '/history': 'Query History',
  '/settings': 'Settings',
}
