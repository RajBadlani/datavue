'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { appNavItems, appNotifications, appPageTitles } from '@/components/app-shell/constants'
import {
  AppLogoMark,
  BellIcon,
  SignOutIcon,
  SettingsIcon,
  getShellNavIcon,
} from '@/components/app-shell/icons'

type AppShellProps = {
  children: React.ReactNode
  user: {
    name: string
    email: string
  }
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDEAFF] text-xs font-semibold text-[#5849F2]">
      {initials || 'DV'}
    </div>
  )
}

function MobileNavItem({ item, active }: { item: (typeof appNavItems)[number]; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#5849F2] focus:ring-offset-2 focus:ring-offset-[#FCFAF5] ${
        active
          ? 'bg-[#EDEAFF] text-[#5849F2]'
          : 'text-[#7B7E8F] hover:bg-[#F7F4EB] hover:text-[#313852]'
      }`}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center">{getShellNavIcon(item.icon)}</span>
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  )
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const pageTitle = appPageTitles[pathname] ?? 'Connections'
  const userName = user.name || 'Datavue User'
  const userEmail = user.email

  const keyboardHint = useMemo(() => (typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac') ? '⌘K' : 'Ctrl K'), [])

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push('/sign-in'),
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#313852]">
      <a href="#app-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-[#313852]">
        Skip to main content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-[#C2CBD4] bg-white lg:flex">
        <div className="flex h-full flex-col px-4 py-5">
          <div>
            <Link href="/connections" className="flex items-center gap-3">
              <AppLogoMark />
              <span className="font-display text-[16px] tracking-[-0.04em] text-[#313852]">Datavue</span>
            </Link>

            <nav className="mt-5 flex flex-col gap-1">
              {appNavItems.map(item => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-r-xl border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'border-[#5849F2] bg-[#EDEAFF] text-[#5849F2]'
                        : 'border-transparent text-[#7B7E8F] hover:bg-[#F7F4EB] hover:text-[#313852]'
                    }`}
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center">{getShellNavIcon(item.icon)}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="mt-auto flex items-center gap-3 rounded-2xl border border-[#E5E0D4] bg-[#FCFAF5] p-3">
            <UserAvatar name={userName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-[#313852]">{userName}</p>
              <p className="truncate text-[12px] text-[#7B7E8F]">{userEmail}</p>
            </div>
            <button type="button" onClick={handleSignOut} className="rounded-full border border-[#C2CBD4] p-2 text-[#7B7E8F] transition-colors hover:bg-white hover:text-[#313852]">
              <SignOutIcon />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[240px]">
        <header className="fixed left-0 right-0 top-0 z-20 h-14 border-b border-[#C2CBD4] bg-white lg:left-[240px]">
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <AppLogoMark />
              </div>
              <p className="text-[16px] font-medium text-[#313852]">{pageTitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-[#E5E0D4] bg-[#F7F4EB] px-3 py-1 text-xs font-medium text-[#5F6475] sm:block">
                Starter Plan
              </div>
              <div className="hidden rounded-full border border-[#E5E0D4] bg-white px-3 py-1 text-xs font-medium text-[#7B7E8F] md:block">
                {keyboardHint}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAlertsOpen(open => !open)}
                  aria-label="Open system alerts"
                  aria-expanded={alertsOpen}
                  className="min-h-11 min-w-11 rounded-full border border-[#C2CBD4] bg-[#F7F4EB] p-2 text-[#313852] transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#5849F2] focus:ring-offset-2 focus:ring-offset-white"
                >
                  <BellIcon />
                </button>

                {alertsOpen ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-2xl border border-[#C2CBD4] bg-white p-3 shadow-[0_20px_60px_rgba(49,56,82,0.08)]">
                    <p className="px-1 text-sm font-medium text-[#313852]">System alerts</p>
                    <div className="mt-3 space-y-2">
                      {appNotifications.map(notification => (
                        <div key={notification.id} className="rounded-xl border border-[#E5E0D4] bg-[#FCFAF5] p-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-[#313852]">{notification.title}</p>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-[#7B7E8F]">{notification.time}</span>
                          </div>
                          <p className="mt-2 text-xs leading-6 text-[#7B7E8F]">{notification.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(open => !open)}
                  aria-label="Open account menu"
                  aria-expanded={profileOpen}
                  className="flex min-h-11 items-center gap-2 rounded-full border border-[#C2CBD4] bg-white px-2 py-1.5 transition-colors hover:bg-[#F7F4EB] focus:outline-none focus:ring-2 focus:ring-[#5849F2] focus:ring-offset-2 focus:ring-offset-white"
                >
                  <UserAvatar name={userName} />
                  <span className="hidden text-xs text-[#7B7E8F] sm:block">Account</span>
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-2xl border border-[#C2CBD4] bg-white p-1.5 shadow-[0_20px_60px_rgba(49,56,82,0.08)]">
                    <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#313852] hover:bg-[#F7F4EB]">
                      <SettingsIcon />
                      Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#313852] hover:bg-[#F7F4EB]">
                      <SettingsIcon />
                      Settings
                    </Link>
                    <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#313852] hover:bg-[#F7F4EB]">
                      <SignOutIcon />
                      Sign Out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main id="app-main" className="relative min-h-screen bg-[#F7F4EB] pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pb-0">
          {children}
        </main>
      </div>

      <nav
        aria-label="Primary mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#C2CBD4] bg-[#FCFAF5] px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_40px_rgba(49,56,82,0.08)] lg:hidden"
      >
        <div className="mx-auto flex max-w-md gap-1">
          {appNavItems.map(item => (
            <MobileNavItem key={item.href} item={item} active={pathname === item.href} />
          ))}
        </div>
      </nav>
    </div>
  )
}
