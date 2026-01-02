'use client'

import { useEffect, useState } from 'react'

type AnimatedCountProps = {
  value: number
  durationMs?: number
}

export function AnimatedCount({ value, durationMs = 800 }: AnimatedCountProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    let rafId = 0
    const start = performance.now()
    const startValue = 0
    const delta = value - startValue

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / durationMs, 1)
      const nextValue = Math.round(startValue + delta * progress)
      setDisplayValue(nextValue)

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [value, durationMs])

  return <span>{displayValue}</span>
}