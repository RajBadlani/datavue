import { requireCurrentUser } from '@/lib/server/resolve-user'
import { SettingsView } from '@/components/settings/settings-view'

export default async function SettingsPage() {
  const user = await requireCurrentUser()

  return (
    <div className="px-6 py-6 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="font-display text-[32px] leading-none tracking-[-0.05em] text-[#313852]">
          Settings
        </h1>
        <p className="mt-2 text-[15px] leading-7 text-[#7B7E8F]">
          Manage your account, AI provider, security, and preferences.
        </p>
      </div>

      <SettingsView
        user={{
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          llmProvider: user.llmProvider,
          hasApiKey: !!user.encryptedApiKey,
        }}
      />
    </div>
  )
}
