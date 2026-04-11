import { authDemoQuery, authDemoRows, authDemoSql } from '@/components/auth/constants/demo-content'

export function AuthDemoPanel() {
  return (
    <div className="w-full max-w-[31rem] rounded-[28px] border border-[#D8DDD3] bg-[#F3EEE3] p-4">
      <div className="rounded-[24px] border border-[#C2CBD4] bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7B7E8F]">
          Natural language query
        </p>
        <div className="mt-4 rounded-2xl border border-[#D9DFE7] bg-[#F7F4EB] px-4 py-3.5 text-[15px] leading-7 text-[#313852]">
          {authDemoQuery}
        </div>
        <div className="mt-4 rounded-2xl border border-[#C2CBD4] bg-[#FAF8F2] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7B7E8F]">
            Generated SQL
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-[12px] leading-5 text-[#313852]">
            <code>{authDemoSql}</code>
          </pre>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#C2CBD4] bg-[#FFFFFF]">
          <div className="grid grid-cols-[1.3fr_1fr_auto] border-b border-[#E8E1D4] bg-[#F7F4EB] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7B7E8F]">
            <span>Segment</span>
            <span>Week</span>
            <span>Revenue</span>
          </div>
          <div className="divide-y divide-[#EEF1F5]">
            {authDemoRows.map(([segment, week, revenue]) => (
              <div key={segment} className="grid grid-cols-[1.3fr_1fr_auto] px-4 py-2.5 text-[13px] text-[#313852]">
                <span className="font-medium">{segment}</span>
                <span>{week}</span>
                <span>{revenue}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E8E1D4] pt-4">
          <div>
            <p className="text-sm font-medium text-[#313852]">Read-only execution</p>
            <p className="text-sm text-[#7B7E8F]">Schema-aware and safe by default</p>
          </div>
          <span className="rounded-full border border-[#B6E2C4] bg-[#E4F0E8] px-3 py-1 text-xs font-semibold text-[#1C6B3C]">
            Connected to PostgreSQL
          </span>
        </div>
      </div>
    </div>
  )
}
