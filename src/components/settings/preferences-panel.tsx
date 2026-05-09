'use client'

import { useState } from 'react'

type PreferencesPanelProps = {
  initialSafetyMode?: string
  initialRowLimit?: number
  initialRetention?: number
}

const ROW_LIMITS = [100, 500, 1000, 5000]
const RETENTION_DAYS = [30, 90, 180, 365]

export function PreferencesPanel({
  initialSafetyMode = 'strict',
  initialRowLimit = 500,
  initialRetention = 90,
}: PreferencesPanelProps) {
  const [safetyMode, setSafetyMode] = useState(initialSafetyMode)
  const [rowLimit, setRowLimit] = useState(initialRowLimit)
  const [retention, setRetention] = useState(initialRetention)

  // Preferences are stored locally for now (no DB column yet) — ready for future persistence
  void safetyMode
  void rowLimit
  void retention

  return (
    <div className="space-y-6">
      {/* Theme toggle */}
      <div>
        <span className="block text-[13px] font-medium text-[#313852]">Theme</span>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-11 items-center gap-2 rounded-full border border-[#C2CBD4] bg-[#F7F4EB] px-4 opacity-60">
            <span className="text-[15px] text-[#313852]">Warm Ledger</span>
            <span className="rounded-full bg-[#EDEAFF] px-2 py-0.5 text-[11px] font-medium text-[#5849F2]">
              Active
            </span>
          </div>
          <div className="flex h-11 items-center gap-2 rounded-full border border-[#C2CBD4] px-4 opacity-40">
            <span className="text-[15px] text-[#7B7E8F]">Dark</span>
            <span className="rounded-full bg-[#F7F4EB] px-2 py-0.5 text-[11px] font-medium text-[#7B7E8F]">
              Coming soon
            </span>
          </div>
        </div>
      </div>

      {/* Query safety mode */}
      <fieldset>
        <legend className="text-[13px] font-medium text-[#313852]">Query safety mode</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[15px] transition-colors ${
              safetyMode === 'strict'
                ? 'border-[#5849F2] bg-[#EDEAFF] text-[#5849F2]'
                : 'border-[#C2CBD4] text-[#313852] hover:border-[#5849F2]/40'
            }`}
          >
            <input
              type="radio"
              name="safety-mode"
              value="strict"
              checked={safetyMode === 'strict'}
              onChange={() => setSafetyMode('strict')}
              className="sr-only"
            />
            Strict (read-only only)
          </label>
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[15px] transition-colors ${
              safetyMode === 'advisory'
                ? 'border-[#5849F2] bg-[#EDEAFF] text-[#5849F2]'
                : 'border-[#C2CBD4] text-[#313852] hover:border-[#5849F2]/40'
            }`}
          >
            <input
              type="radio"
              name="safety-mode"
              value="advisory"
              checked={safetyMode === 'advisory'}
              onChange={() => setSafetyMode('advisory')}
              className="sr-only"
            />
            Advisory (warn on writes)
          </label>
        </div>
      </fieldset>

      {/* Default row limit */}
      <div>
        <label htmlFor="row-limit" className="block text-[13px] font-medium text-[#313852]">
          Default row limit
        </label>
        <select
          id="row-limit"
          value={rowLimit}
          onChange={e => setRowLimit(Number(e.target.value))}
          className="mt-2 h-12 w-40 rounded-[16px] border border-[#C2CBD4] bg-white px-4 text-[15px] text-[#313852] outline-none transition-colors focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
        >
          {ROW_LIMITS.map(limit => (
            <option key={limit} value={limit}>
              {limit.toLocaleString()} rows
            </option>
          ))}
        </select>
      </div>

      {/* Audit retention */}
      <div>
        <label htmlFor="audit-retention" className="block text-[13px] font-medium text-[#313852]">
          Audit log retention
        </label>
        <select
          id="audit-retention"
          value={retention}
          onChange={e => setRetention(Number(e.target.value))}
          className="mt-2 h-12 w-40 rounded-[16px] border border-[#C2CBD4] bg-white px-4 text-[15px] text-[#313852] outline-none transition-colors focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
        >
          {RETENTION_DAYS.map(days => (
            <option key={days} value={days}>
              {days} days
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
