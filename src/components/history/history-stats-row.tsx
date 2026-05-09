'use client'

type Stats = {
  totalQueries: number
  successRate: number
  avgExecutionMs: number
  blockedCount: number
}

export function HistoryStatsRow({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Total Queries', value: stats.totalQueries.toLocaleString() },
    { label: 'Success Rate', value: `${stats.successRate}%` },
    { label: 'Avg Execution', value: stats.avgExecutionMs > 0 ? `${stats.avgExecutionMs}ms` : '—' },
    { label: 'Blocked', value: stats.blockedCount.toLocaleString() },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(card => (
        <div
          key={card.label}
          className="rounded-[16px] border border-[#C2CBD4] bg-white p-6"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7B7E8F]">
            {card.label}
          </span>
          <p className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-[#313852]">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
