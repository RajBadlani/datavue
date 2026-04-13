import { useEffect, useState } from 'react'
import { useInView } from '@/components/landing/hooks/use-in-view'

type NumberTickerProps = {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
}

export function NumberTicker({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
}: NumberTickerProps) {
  const { ref, isInView } = useInView<HTMLSpanElement>()
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let frame = 0
    const startedAt = performance.now()
    const duration = 1200

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplayValue(value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isInView, value])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  )
}
