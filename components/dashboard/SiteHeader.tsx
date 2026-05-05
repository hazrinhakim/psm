'use client'

import { useEffect, useState } from 'react'
import { ModeToggle } from '@/components/mode-toggle'
import { NotificationsBell } from '@/components/dashboard/NotificationsBell'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'sticky z-30 flex h-18 shrink-0 items-center justify-between px-4 transition-all duration-300 ease-out sm:px-6',
        isScrolled
          ? 'top-4 mx-4 rounded-2xl border border-border/70 bg-white/90 shadow-lg backdrop-blur-xs supports-[backdrop-filter]:bg-white/80 dark:bg-slate-950/80 dark:shadow-black/20 dark:supports-[backdrop-filter]:bg-slate-950/72'
          : 'top-0 rounded-t-[inherit] border-b border-border/70 bg-white shadow-none dark:bg-card'
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="-ml-1 rounded-xl border border-border/70 bg-card shadow-sm md:size-9" />
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            ICAMS Workspace
          </p>
          <h1 className="truncate text-sm font-semibold tracking-[-0.02em] text-foreground md:text-base">
            ICT Assets Management System
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <NotificationsBell />
      </div>
    </header>
  )
}
