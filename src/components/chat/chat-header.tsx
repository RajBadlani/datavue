'use client'

type ChatHeaderProps = {
  connectionName: string
  syncStatus: string
  dbType: string
  onNewConversation: () => void
}

export function ChatHeader({ connectionName, syncStatus, dbType, onNewConversation }: ChatHeaderProps) {
  const isSynced = syncStatus === 'SYNCED'

  return (
    <div className="flex items-center justify-between border-b border-[#C2CBD4] bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${isSynced ? 'bg-green-500' : 'bg-amber-400'}`}
            aria-label={isSynced ? 'Connected' : 'Syncing'}
          />
          <h1 className="text-[15px] font-medium text-[#313852]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {connectionName}
          </h1>
        </div>
        <span className="rounded-full bg-[#F7F4EB] px-2 py-0.5 text-[11px] font-medium text-[#7B7E8F]">
          {dbType}
        </span>
      </div>
      <button
        type="button"
        onClick={onNewConversation}
        className="flex items-center gap-1.5 rounded-full bg-[#EDEAFF] px-3 py-1.5 text-[13px] font-medium text-[#5849F2] transition-colors hover:bg-[#D8D2FF] focus:outline-none focus:ring-2 focus:ring-[#5849F2] focus:ring-offset-2"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">New conversation</span>
      </button>
    </div>
  )
}
