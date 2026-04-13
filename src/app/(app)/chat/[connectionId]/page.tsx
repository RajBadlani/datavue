type ChatPageProps = {
  params: Promise<{ connectionId: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { connectionId } = await params

  return (
    <div className="px-6 py-6 sm:px-8 lg:px-10">
      <div className="rounded-[24px] border border-[#C2CBD4] bg-white p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5849F2]">Chat</p>
        <h1 className="mt-4 font-display text-[32px] leading-none tracking-[-0.05em] text-[#313852]">Connection mounted</h1>
        <p className="mt-4 text-[15px] leading-7 text-[#7B7E8F]">Chat route placeholder for connection <span className="font-mono text-[#313852]">{connectionId}</span>. This keeps the Open Chat flow functional from the new connections UX.</p>
      </div>
    </div>
  )
}
