'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

type SettingsViewProps = {
  initialName: string
  email: string
  emailVerified: boolean
  memberSince: string
}

type Banner = { tone: 'success' | 'error'; message: string } | null

const inputClass =
  'h-12 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm text-[#313852] outline-none transition-colors placeholder:text-[#8B8FA0] focus:border-[#5849F2] disabled:cursor-not-allowed disabled:opacity-60'

const labelClass = 'flex flex-col gap-2 text-sm font-medium text-[#313852]'

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-[#E5E0D4] bg-[#FCFAF5] p-6 sm:p-7">
      <h2 className="text-[16px] font-semibold text-[#313852]">{title}</h2>
      <p className="mt-1 text-[13px] leading-6 text-[#7B7E8F]">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Feedback({ banner }: { banner: Banner }) {
  if (!banner) return null
  const isError = banner.tone === 'error'
  return (
    <p
      role={isError ? 'alert' : 'status'}
      className={`mt-3 rounded-2xl border px-4 py-2.5 text-[13px] ${
        isError
          ? 'border-[#F5B6B0] bg-[#FFF1EF] text-[#9F2F25]'
          : 'border-[#BFE4C7] bg-[#E8F8EC] text-[#1C6B3C]'
      }`}
    >
      {banner.message}
    </p>
  )
}

export function SettingsView({ initialName, email, emailVerified, memberSince }: SettingsViewProps) {
  const [name, setName] = useState(initialName)
  const [savingName, setSavingName] = useState(false)
  const [nameBanner, setNameBanner] = useState<Banner>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signOutOthers, setSignOutOthers] = useState(true)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordBanner, setPasswordBanner] = useState<Banner>(null)

  async function handleSaveName(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 1) {
      setNameBanner({ tone: 'error', message: 'Name cannot be empty.' })
      return
    }

    setSavingName(true)
    setNameBanner(null)

    const { error } = await authClient.updateUser({ name: trimmed })

    setSavingName(false)
    if (error) {
      setNameBanner({ tone: 'error', message: error.message || 'Could not update your name.' })
      return
    }
    setNameBanner({ tone: 'success', message: 'Profile updated.' })
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault()

    if (newPassword.length < 8) {
      setPasswordBanner({ tone: 'error', message: 'New password must be at least 8 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordBanner({ tone: 'error', message: 'New password and confirmation do not match.' })
      return
    }

    setSavingPassword(true)
    setPasswordBanner(null)

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: signOutOthers,
    })

    setSavingPassword(false)
    if (error) {
      setPasswordBanner({ tone: 'error', message: error.message || 'Could not change your password.' })
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordBanner({
      tone: 'success',
      message: signOutOthers
        ? 'Password changed. Other sessions were signed out.'
        : 'Password changed.',
    })
  }

  return (
    <div className="px-6 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <h1 className="font-display text-[28px] leading-none tracking-[-0.05em] text-[#313852]">Settings</h1>
          <p className="mt-2 text-[13px] text-[#7B7E8F]">Manage your profile and account security.</p>
        </div>

        <SectionCard title="Profile" description="Your display name and account details.">
          <form onSubmit={handleSaveName} className="flex flex-col gap-4">
            <label className={labelClass}>
              Display name
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                maxLength={80}
                className={inputClass}
                placeholder="Your name"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Email
                <input value={email} readOnly disabled className={inputClass} />
                <span className="text-[12px] font-normal text-[#7B7E8F]">
                  {emailVerified ? 'Verified' : 'Not verified'}
                </span>
              </label>
              <label className={labelClass}>
                Member since
                <input value={memberSince} readOnly disabled className={inputClass} />
              </label>
            </div>

            <Feedback banner={nameBanner} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingName}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#5849F2] px-6 text-sm font-semibold text-[#FCFAF5] transition-colors hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2"
              >
                {savingName ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Security" description="Change your password. Optionally sign out everywhere else.">
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <label className={labelClass}>
              Current password
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={event => setCurrentPassword(event.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={event => setNewPassword(event.target.value)}
                  className={inputClass}
                  placeholder="At least 8 characters"
                />
              </label>
              <label className={labelClass}>
                Confirm new password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  className={inputClass}
                  placeholder="Re-enter new password"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 text-[13px] text-[#313852]">
              <input
                type="checkbox"
                checked={signOutOthers}
                onChange={event => setSignOutOthers(event.target.checked)}
                className="h-4 w-4 rounded border-[#C2CBD4] text-[#5849F2] focus:ring-[#5849F2]"
              />
              Sign out of other sessions after changing my password
            </label>

            <Feedback banner={passwordBanner} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#5849F2] px-6 text-sm font-semibold text-[#FCFAF5] transition-colors hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2"
              >
                {savingPassword ? 'Updating…' : 'Change password'}
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}
