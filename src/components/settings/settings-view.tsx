'use client'

import { SettingsSection } from './settings-section'
import { AccountPanel } from './account-panel'
import { LlmProviderPanel } from './llm-provider-panel'
import { SecurityPanel } from './security-panel'
import { PreferencesPanel } from './preferences-panel'
import { DangerZonePanel } from './danger-zone-panel'

type LLMProvider = 'ANTHROPIC' | 'OPENAI' | 'OLLAMA'

type SettingsViewProps = {
  user: {
    name: string
    email: string
    emailVerified: boolean
    llmProvider: LLMProvider
    hasApiKey: boolean
  }
}

export function SettingsView({ user }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      <SettingsSection label="Account" title="Profile" description="Manage your display name and sign-out.">
        <AccountPanel user={user} />
      </SettingsSection>

      <SettingsSection label="AI" title="LLM Provider & API Key" description="Choose your AI provider and optionally bring your own key.">
        <LlmProviderPanel
          currentProvider={user.llmProvider}
          hasApiKey={user.hasApiKey}
        />
      </SettingsSection>

      <SettingsSection label="Security" title="Password & Sessions" description="Update your password and manage active sessions.">
        <SecurityPanel />
      </SettingsSection>

      <SettingsSection label="Preferences" title="Workspace Preferences" description="Customize query behavior and display settings.">
        <PreferencesPanel />
      </SettingsSection>

      <SettingsSection label="Danger" title="Danger Zone" description="Irreversible actions. Proceed with caution." variant="danger">
        <DangerZonePanel userEmail={user.email} />
      </SettingsSection>
    </div>
  )
}
