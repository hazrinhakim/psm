'use client'

import { useEffect, useRef, useState } from 'react'

type AnimatedCountProps = {
  value: number
  durationMs?: number
}

export function AnimatedCount({ value, durationMs = 700 }: AnimatedCountProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = 0
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const nextValue = Math.round(startValue + (value - startValue) * progress)
      setDisplayValue(nextValue)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value, durationMs])

  return <>{displayValue}</>
}
