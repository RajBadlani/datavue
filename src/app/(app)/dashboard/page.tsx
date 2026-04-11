export default function DashboardPage() {
  return (
    <div className="px-6 py-6 sm:px-8 lg:px-10">
      <div className="rounded-[24px] border border-[#C2CBD4] bg-white p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5849F2]">Dashboard</p>
        <h1 className="mt-4 font-display text-[36px] leading-none tracking-[-0.05em] text-[#313852]">Your Datavue workspace is active.</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#7B7E8F]">
          Start from Connections to mount a database, inspect schema metadata, and move straight into query workflows.
        </p>
      </div>
    </div>
  )
}
