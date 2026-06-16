import prisma from '@/lib/prisma'
import { requireUserOrRedirect } from '@/lib/server/resolve-user'
import { AuditFeedView } from '@/components/audit/audit-feed-view'

type HistoryPageProps = {
  searchParams: Promise<{ connection?: string }>
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const user = await requireUserOrRedirect()
  const { connection: connectionParam } = await searchParams

  const connections = await prisma.connection.findMany({
    where: { userId: user.id, isArchived: false },
    select: { id: true, label: true },
    orderBy: { createdAt: 'desc' },
  })

  // Only honor the deep-link filter if it points at a connection the user owns.
  const initialConnectionId =
    connectionParam && connections.some(connection => connection.id === connectionParam)
      ? connectionParam
      : ''

  return (
    <div className="px-6 py-6 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="font-display text-[28px] leading-none tracking-[-0.05em] text-[#313852]">Query History</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#7B7E8F]">
            A complete, immutable record of every question asked across your connections — the SQL that ran, whether it
            succeeded, was blocked, or failed, the columns masked before any data left your database, and timing. Filter
            by status to audit what was refused or redacted, open a query back in chat, or export for review.
          </p>
        </div>

        <AuditFeedView
          connections={connections}
          initialFilters={{ connectionId: initialConnectionId, status: '', from: '', to: '' }}
          enableOpenInChat
          enableExport
          emptyTitle="No queries yet"
          emptyDescription="Once you start asking questions in chat, every query you run will appear here with its SQL, status, masked columns, and result size."
        />
      </div>
    </div>
  )
}
