'use client'

import { motion } from 'framer-motion'
import { usePathname, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routeKey = `${pathname}?${searchParams.toString()}`

  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  )
}
