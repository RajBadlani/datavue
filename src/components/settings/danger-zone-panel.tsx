'use client'

import { useState } from 'react'

type DangerZonePanelProps = {
  userEmail: string
}

export function DangerZonePanel({ userEmail }: DangerZonePanelProps) {
  const [showDeleteConversations, setShowDeleteConversations] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteConversations() {
    setDeleting(true)
    try {
      const res = await fetch('/api/settings/conversations', { method: 'DELETE' })
      if (res.ok) {
        setShowDeleteConversations(false)
      }
    } finally {
      setDeleting(false)
    }
  }

  async function handleDeleteAccount() {
    if (confirmEmail !== userEmail) return
    setDeleting(true)
    try {
      const res = await fetch('/api/settings/account', { method: 'DELETE' })
      if (res.ok) {
        window.location.href = '/auth/sign-in'
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Delete conversations */}
      <div>
        {!showDeleteConversations ? (
          <button
            type="button"
            onClick={() => setShowDeleteConversations(true)}
            className="h-11 rounded-full border border-[#9F2F25] px-6 text-[15px] font-medium text-[#9F2F25] transition-colors hover:bg-[#9F2F25] hover:text-white"
          >
            Delete all conversations
          </button>
        ) : (
          <div className="rounded-[16px] border border-[#F5B6B0] bg-white p-4">
            <p className="text-[15px] text-[#9F2F25]">
              This will permanently delete all your conversations and cannot be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleDeleteConversations}
                disabled={deleting}
                className="h-10 rounded-full bg-[#9F2F25] px-5 text-[14px] font-medium text-white transition-opacity disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Confirm delete'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConversations(false)}
                className="h-10 rounded-full border border-[#C2CBD4] px-5 text-[14px] font-medium text-[#313852]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete account */}
      <div>
        {!showDeleteAccount ? (
          <button
            type="button"
            onClick={() => setShowDeleteAccount(true)}
            className="h-11 rounded-full border border-[#9F2F25] px-6 text-[15px] font-medium text-[#9F2F25] transition-colors hover:bg-[#9F2F25] hover:text-white"
          >
            Delete account
          </button>
        ) : (
          <div className="rounded-[16px] border border-[#F5B6B0] bg-white p-4">
            <p className="text-[15px] text-[#9F2F25]">
              This will permanently delete your account, all connections, conversations, and audit logs. Type your email to confirm.
            </p>
            <input
              type="email"
              value={confirmEmail}
              onChange={e => setConfirmEmail(e.target.value)}
              placeholder={userEmail}
              aria-label="Type your email to confirm account deletion"
              className="mt-3 h-12 w-full max-w-sm rounded-[16px] border border-[#F5B6B0] bg-white px-4 text-[15px] text-[#313852] outline-none focus:ring-2 focus:ring-[#F5B6B0]"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || confirmEmail !== userEmail}
                className="h-10 rounded-full bg-[#9F2F25] px-5 text-[14px] font-medium text-white transition-opacity disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Permanently delete account'}
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteAccount(false); setConfirmEmail('') }}
                className="h-10 rounded-full border border-[#C2CBD4] px-5 text-[14px] font-medium text-[#313852]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
