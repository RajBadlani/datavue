'use client'

type ChatHeaderProps = {
  connectionName: string
  syncStatus: string
  dbType: string
  onNewConversation: () => void
}

function getSyncState(syncStatus: string) {
  if (syncStatus === 'SYNCED') {
    return {
      dotClassName: 'bg-[#1C6B3C]',
      label: 'Schema ready',
      labelClassName: 'bg-[#E8F8EC] text-[#1C6B3C]',
    }
  }

  if (syncStatus === 'FAILED') {
    return {
      dotClassName: 'bg-[#9F2F25]',
      label: 'Sync failed',
      labelClassName: 'bg-[#FFF1EF] text-[#9F2F25]',
    }
  }

  return {
    dotClassName: 'bg-[#5849F2]',
    label: 'Schema syncing',
    labelClassName: 'bg-[#EDEAFF] text-[#5849F2]',
  }
}

export function ChatHeader({ connectionName, syncStatus, dbType, onNewConversation }: ChatHeaderProps) {
  const syncState = getSyncState(syncStatus)

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#C2CBD4] bg-white px-4 py-3 sm:px-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${syncState.dotClassName}`} aria-hidden="true" />
            <h1 className="truncate text-[15px] font-medium text-[#313852]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {connectionName}
            </h1>
          </div>
          <span className="rounded-full bg-[#F7F4EB] px-2 py-0.5 text-[11px] font-medium text-[#7B7E8F]">{dbType}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${syncState.labelClassName}`}>{syncState.label}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onNewConversation}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#EDEAFF] px-3 py-1.5 text-[13px] font-medium text-[#5849F2] transition-colors hover:bg-[#D8D2FF] focus:outline-none focus:ring-2 focus:ring-[#5849F2] focus:ring-offset-2"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">New conversation</span>
      </button>
    </div>
  )
}
