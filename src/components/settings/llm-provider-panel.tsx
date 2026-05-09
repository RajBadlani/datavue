'use client'

import { useState } from 'react'

type LLMProvider = 'ANTHROPIC' | 'OPENAI' | 'OLLAMA'

const PROVIDERS: { value: LLMProvider; label: string; description: string }[] = [
  { value: 'ANTHROPIC', label: 'Anthropic', description: 'Claude models' },
  { value: 'OPENAI', label: 'OpenAI', description: 'GPT models' },
  { value: 'OLLAMA', label: 'Ollama', description: 'Local models' },
]

type LlmProviderPanelProps = {
  currentProvider: LLMProvider
  hasApiKey: boolean
  modelOverride?: string
}

export function LlmProviderPanel({ currentProvider, hasApiKey, modelOverride: initialModel }: LlmProviderPanelProps) {
  const [provider, setProvider] = useState<LLMProvider>(currentProvider)
  const [apiKey, setApiKey] = useState('')
  const [modelOverride, setModelOverride] = useState(initialModel || '')
  const [showKeyInput, setShowKeyInput] = useState(!hasApiKey)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [saveMessage, setSaveMessage] = useState('')

  async function handleSave() {
    setSaving(true)
    setSaveMessage('')
    try {
      const body: Record<string, string> = { provider }
      if (apiKey) body.apiKey = apiKey
      if (modelOverride.trim()) body.modelOverride = modelOverride.trim()

      const res = await fetch('/api/settings/llm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSaveMessage('Saved')
        setApiKey('')
        setShowKeyInput(false)
        setTimeout(() => setSaveMessage(''), 2000)
      } else {
        const data = await res.json() as { error?: { message?: string } }
        setSaveMessage(data.error?.message || 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/settings/llm/test', { method: 'POST' })
      const data = await res.json() as { success?: boolean; error?: { message?: string } }
      if (res.ok && data.success) {
        setTestResult({ ok: true, message: 'Connection successful' })
      } else {
        setTestResult({ ok: false, message: data.error?.message || 'Test failed' })
      }
    } catch {
      setTestResult({ ok: false, message: 'Network error' })
    } finally {
      setTesting(false)
    }
  }

  function handleRemoveKey() {
    setShowKeyInput(true)
    setApiKey('')
  }

  return (
    <div className="space-y-6">
      {/* Provider selection */}
      <fieldset>
        <legend className="text-[13px] font-medium text-[#313852]">Provider</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {PROVIDERS.map(p => (
            <label
              key={p.value}
              className={`flex cursor-pointer flex-col rounded-[16px] border p-4 transition-colors ${
                provider === p.value
                  ? 'border-[#5849F2] bg-[#EDEAFF]'
                  : 'border-[#C2CBD4] bg-white hover:border-[#5849F2]/40'
              }`}
            >
              <input
                type="radio"
                name="llm-provider"
                value={p.value}
                checked={provider === p.value}
                onChange={() => setProvider(p.value)}
                className="sr-only"
              />
              <span className={`text-[15px] font-medium ${provider === p.value ? 'text-[#5849F2]' : 'text-[#313852]'}`}>
                {p.label}
              </span>
              <span className="mt-0.5 text-[13px] text-[#7B7E8F]">{p.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* API Key */}
      <div>
        <label htmlFor="settings-api-key" className="block text-[13px] font-medium text-[#313852]">
          API Key (BYOK)
        </label>
        {!showKeyInput && hasApiKey ? (
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[15px] text-[#7B7E8F]">•••• •••• •••• configured</span>
            <button
              type="button"
              onClick={() => setShowKeyInput(true)}
              className="text-[13px] font-medium text-[#5849F2] hover:underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleRemoveKey}
              className="text-[13px] font-medium text-[#9F2F25] hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            id="settings-api-key"
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="mt-2 h-12 w-full rounded-[16px] border border-[#C2CBD4] bg-white px-4 text-[15px] text-[#313852] outline-none transition-colors focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
          />
        )}
      </div>

      {/* Model override */}
      <div>
        <label htmlFor="settings-model" className="block text-[13px] font-medium text-[#313852]">
          Model override <span className="text-[#7B7E8F]">(optional)</span>
        </label>
        <input
          id="settings-model"
          type="text"
          value={modelOverride}
          onChange={e => setModelOverride(e.target.value)}
          placeholder="e.g. claude-sonnet-4-20250514"
          className="mt-2 h-12 w-full rounded-[16px] border border-[#C2CBD4] bg-white px-4 text-[15px] text-[#313852] outline-none transition-colors focus:border-[#5849F2] focus:ring-2 focus:ring-[#EDEAFF]"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-11 rounded-full bg-[#5849F2] px-6 text-[15px] font-medium text-white transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save provider settings'}
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="h-11 rounded-full border border-[#313852] bg-transparent px-6 text-[15px] font-medium text-[#313852] transition-colors hover:bg-[#313852] hover:text-white disabled:opacity-50"
        >
          {testing ? 'Testing…' : 'Test connection'}
        </button>
        {saveMessage && (
          <span className="text-[13px] font-medium text-[#5849F2]">{saveMessage}</span>
        )}
        {testResult && (
          <span className={`text-[13px] font-medium ${testResult.ok ? 'text-green-600' : 'text-[#9F2F25]'}`}>
            {testResult.message}
          </span>
        )}
      </div>
    </div>
  )
}
