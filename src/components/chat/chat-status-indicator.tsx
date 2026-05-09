type ChatStatusIndicatorProps = {
  step: string
}

export function ChatStatusIndicator({ step }: ChatStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex gap-1" aria-label="Loading">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#5849F2] [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#5849F2] [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#5849F2] [animation-delay:300ms]" />
      </div>
      <span className="text-[13px] text-[#7B7E8F]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {step}
      </span>
    </div>
  )
}
