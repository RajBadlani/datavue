import { AppShell } from '@/components/app-shell'
import { requireUserOrRedirect } from '@/lib/server/resolve-user'

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserOrRedirect()

  return (
    <AppShell user={{ name: user.name, email: user.email }}>
      {children}
    </AppShell>
  )
}
