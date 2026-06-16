import { requireUserOrRedirect } from '@/lib/server/resolve-user'
import { SettingsView } from '@/components/settings/settings-view'

function formatMemberSince(value: Date) {
  return value.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function SettingsPage() {
  const user = await requireUserOrRedirect()

  return (
    <SettingsView
      initialName={user.name ?? ''}
      email={user.email}
      emailVerified={user.emailVerified}
      memberSince={formatMemberSince(user.createdAt)}
    />
  )
}
