import Link from 'next/link'
import prisma from '@/lib/prisma'
import { requireUserOrRedirect } from '@/lib/server/resolve-user'

function getDbLabel(dbType: string) {
  if (dbType === 'POSTGRES') return 'PostgreSQL'
  if (dbType === 'MYSQL') return 'MySQL'
  if (dbType === 'MONGODB') return 'MongoDB'
  if (dbType === 'SQLITE') return 'SQLite'
  return dbType
}

type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'

function getSyncMeta(status: SyncStatus) {
  if (status === 'SYNCED') {
    return { label: 'Ready', text: '#1C6B3C', bg: '#E8F8EC', border: '#BFE4C7', ready: true }
  }
  if (status === 'SYNCING' || status === 'PENDING') {
    return { label: status === 'SYNCING' ? 'Syncing' : 'Queued', text: '#5849F2', bg: '#EDEAFF', border: '#D8D2FF', ready: false }
  }
  return { label: 'Sync failed', text: '#9F2F25', bg: '#FFF1EF', border: '#F5B6B0', ready: false }
}

function DbGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </svg>
  )
}

export default async function ChatLandingPage() {
  const user = await requireUserOrRedirect()

  const allConnections = await prisma.connection.findMany({
    where: { userId: user.id, isArchived: false },
    select: {
      id: true,
      label: true,
      dbType: true,
      syncStatus: true,
      _count: { select: { schemaMetadata: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Surface ready (SYNCED, clickable) connections first — they are the ones a
  // user can actually open. Enum column sort follows declaration order, not
  // readiness, so partition in app code instead.
  const connections = [
    ...allConnections.filter(connection => connection.syncStatus === 'SYNCED'),
    ...allConnections.filter(connection => connection.syncStatus !== 'SYNCED'),
  ]

  return (
    <div className="px-6 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-display text-[28px] leading-none tracking-[-0.05em] text-[#313852]">Chat</h1>
          <p className="mt-2 text-[13px] text-[#7B7E8F]">
            Pick a connection to ask questions about your data in plain English.
          </p>
        </div>

        {connections.length === 0 ? (
          <div className="rounded-[24px] border border-[#E5E0D4] bg-[#FCFAF5] p-8 text-center sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDEAFF] text-[#5849F2]">
              <DbGlyph />
            </div>
            <h2 className="mt-5 font-display text-[20px] leading-none tracking-[-0.04em] text-[#313852]">Connect a database to start chatting</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#7B7E8F]">
              Chat needs a synced connection. Add a read-only database connection, wait for its schema to sync, then come
              back here to ask questions.
            </p>
            <Link
              href="/connections"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#5849F2] px-6 text-sm font-semibold text-[#FCFAF5] transition-colors hover:bg-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2"
            >
              Go to Connections
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {connections.map(connection => {
              const meta = getSyncMeta(connection.syncStatus as SyncStatus)
              const tableCount = connection._count.schemaMetadata

              const card = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F4EB] text-[#313852]">
                        <DbGlyph />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-medium text-[#313852]">{connection.label}</p>
                        <p className="text-[12px] text-[#7B7E8F]">{getDbLabel(connection.dbType)} · {tableCount} table{tableCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                      style={{ backgroundColor: meta.bg, borderColor: meta.border, color: meta.text }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.text }} />
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-4 text-[13px] font-medium">
                    {meta.ready ? (
                      <span className="inline-flex items-center gap-1.5 text-[#5849F2]">
                        Open chat
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-[#7B7E8F]">
                        {connection.syncStatus === 'FAILED'
                          ? 'Re-sync this connection before chatting'
                          : 'Available once schema sync completes'}
                      </span>
                    )}
                  </div>
                </>
              )

              const baseClass = 'rounded-[20px] border bg-white p-4 transition-all duration-200'

              return meta.ready ? (
                <Link
                  key={connection.id}
                  href={`/connections/${connection.id}/chat`}
                  className={`${baseClass} border-[#C2CBD4] hover:border-[#5849F2] hover:shadow-[0_18px_50px_rgba(49,56,82,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F4EB]`}
                >
                  {card}
                </Link>
              ) : (
                <div key={connection.id} className={`${baseClass} border-[#E5E0D4] opacity-80`}>
                  {card}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
