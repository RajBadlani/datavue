import { requireCurrentUser } from '@/lib/server/resolve-user'
import prisma from '@/lib/prisma'
import { HistoryView } from '@/components/history/history-view'

export default async function HistoryPage() {
  const user = await requireCurrentUser()

  // Fetch user's connections for the filter dropdown
  const connections = await prisma.connection.findMany({
    where: { userId: user.id, isArchived: false },
    select: { id: true, label: true },
    orderBy: { label: 'asc' },
  })

  return (
    <div className="px-6 py-6 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="font-display text-[32px] leading-none tracking-[-0.05em] text-[#313852]">
          Query History
        </h1>
        <p className="mt-2 text-[15px] leading-7 text-[#7B7E8F]">
          Browse, filter, and export your past queries across all connections.
        </p>
      </div>

      <HistoryView connections={connections} />
    </div>
  )
}
