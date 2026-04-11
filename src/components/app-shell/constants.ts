export const appNavItems = [
  { href: '/connections', label: 'Connections', icon: 'database' },
  { href: '/history', label: 'Query History', icon: 'history' },
  { href: '/audit-logs', label: 'Audit Logs', icon: 'shield' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
] as const

export const appPageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/connections': 'Connections',
  '/history': 'Query History',
  '/audit-logs': 'Audit Logs',
  '/settings': 'Settings',
}

export const appNotifications = [
  {
    id: 'notif-1',
    title: 'Schema sync complete',
    description: 'Northstar Production is ready for querying.',
    time: '2m ago',
  },
  {
    id: 'notif-2',
    title: 'Connection check failed',
    description: 'Analytics Replica is unreachable from your current network.',
    time: '16m ago',
  },
]
