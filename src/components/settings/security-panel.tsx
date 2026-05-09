'use client'

import { useState } from 'react'

export function SecurityPanel() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleChangePassword() {
    if (!oldPassword || !newPassword || newPassword !== confirmPassword) return
    if (newPassword.length < 8) {
      setPasswordMessage({ ok: false, text: 'Password must be at least 8 characters' })
      return
    }
    setChangingPassword(true)
    setPasswordMessage(null)
    try {
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
      })
      if (res.ok) {
        setPasswordMessage({ ok: true, text: 'Password updated' })
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await res.json() as { error?: { message?: string } }
        setPasswordMessage({ ok: false, text: data.error?.message || 'Failed to change password' })
      }
    } finally {
      setChangingPassword(false)
    }
  }

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  return (
    <div className="space-y-6">
      {/* Change password */}
      <div>
        <h3 className="text-[15px] font-medium text-[#313852]">Change password</h3>
        <div className="mt-3 max-w-sm space-y-3">
          <div>
            <label htmlFor="old-password" className="block text-[13px] font-medium text-[#313852]">
              Current password
            </label>
            <input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 h-12 w-full rounded-[16px] border border-[#C2CBD4] bg-white px-4 text-[15px] text-[#313852] outline-none transition-colors focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-[13px] font-medium text-[#313852]">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1 h-12 w-full rounded-[16px] border border-[#C2CBD4] bg-white px-4 text-[15px] text-[#313852] outline-none transition-colors focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-[13px] font-medium text-[#313852]">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={`mt-1 h-12 w-full rounded-[16px] border bg-white px-4 text-[15px] text-[#313852] outline-none transition-colors focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF] ${
                passwordMismatch ? 'border-[#F5B6B0]' : 'border-[#C2CBD4]'
              }`}
            />
            {passwordMismatch && (
              <p className="mt-1 text-[13px] text-[#9F2F25]">Passwords do not match</p>
            )}
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={changingPassword || !oldPassword || !newPassword || passwordMismatch}
              className="h-11 rounded-full bg-[#5849F2] px-6 text-[15px] font-medium text-white transition-opacity disabled:opacity-50"
            >
              {changingPassword ? 'Updating…' : 'Update password'}
            </button>
            {passwordMessage && (
              <span className={`text-[13px] font-medium ${passwordMessage.ok ? 'text-green-600' : 'text-[#9F2F25]'}`}>
                {passwordMessage.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
