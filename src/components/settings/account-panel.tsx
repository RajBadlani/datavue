'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

type AccountPanelProps = {
  user: {
    name: string
    email: string
    emailVerified: boolean
  }
}

export function AccountPanel({ user }: AccountPanelProps) {
  const [name, setName] = useState(user.name)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSaveName() {
    if (!name.trim() || name === user.name) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = '/auth/sign-in'
  }

  const initials = (user.name || user.email).charAt(0).toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EDEAFF] text-[18px] font-semibold text-[#5849F2]"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <label htmlFor="settings-name" className="block text-[13px] font-medium text-[#313852]">
              Display name
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-12 flex-1 rounded-[16px] border border-[#C2CBD4] bg-white px-4 text-[15px] text-[#313852] outline-none transition-colors focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={saving || !name.trim() || name === user.name}
                className="h-12 rounded-full bg-[#5849F2] px-5 text-[15px] font-medium text-white transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#313852]">Email</label>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[15px] text-[#7B7E8F]">{user.email}</span>
              <span
                className={`inline-block h-2 w-2 rounded-full ${user.emailVerified ? 'bg-green-500' : 'bg-[#7B7E8F]'}`}
                title={user.emailVerified ? 'Verified' : 'Not verified'}
                aria-label={user.emailVerified ? 'Email verified' : 'Email not verified'}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#C2CBD4] pt-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="h-11 rounded-full border border-[#313852] bg-transparent px-6 text-[15px] font-medium text-[#313852] transition-colors hover:bg-[#313852] hover:text-white"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
