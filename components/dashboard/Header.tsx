'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { NotificationsBell } from '@/components/dashboard/NotificationsBell'

export function Header() {
  return (
    <header className="h-14 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <span className="text-sm font-medium text-muted-foreground">
          ICT Asset Management System
        </span>
      </div>
      <div className="flex items-center gap-2">
        <NotificationsBell />
      </div>
    </header>
  )
}
