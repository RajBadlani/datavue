import { redirect } from 'next/navigation'

// Audit Logs and Query History were merged into a single page. Preserve any old
// links/bookmarks by redirecting to the combined history view.
export default function AuditLogsPage() {
  redirect('/history')
}
