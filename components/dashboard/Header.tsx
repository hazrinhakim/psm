'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { NotificationsBell } from '@/components/dashboard/NotificationsBell'

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between rounded-lg border border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
      </div>
      <div className="flex items-center gap-2">
        <NotificationsBell />
      </div>
    </header>
  )
}
