'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Wrench,
  Package,
  Users,
  QrCode,
  Bell,
  MessageSquare,
  FileBarChart,
  Scan,
} from 'lucide-react'
import type { UserRole } from '@/lib/roles'

import type { LucideIcon } from 'lucide-react'

const menus: Record<
  UserRole,
  { label: string; path: string; icon: LucideIcon }[]
> =
  {
    admin: [
      { label: 'Dashboard', path: '', icon: LayoutDashboard },
      { label: 'Assets', path: '/assets', icon: Package },
      { label: 'Maintenance', path: '/maintenance', icon: Wrench },
      { label: 'Scan QR', path: '/scan', icon: Scan },
      { label: 'QR Codes', path: '/qr', icon: QrCode },
      { label: 'Reports', path: '/reports', icon: FileBarChart },
      { label: 'Feedback', path: '/feedback', icon: MessageSquare },
      { label: 'Users', path: '/users', icon: Users },
    ],
    admin_assistant: [
      { label: 'Dashboard', path: '', icon: LayoutDashboard },
      { label: 'Assets', path: '/assets', icon: Package },
      { label: 'Maintenance', path: '/maintenance', icon: Wrench },
      { label: 'Scan QR', path: '/scan', icon: Scan },
      { label: 'QR Codes', path: '/qr', icon: QrCode },
      { label: 'Reports', path: '/reports', icon: FileBarChart },
      { label: 'Feedback', path: '/feedback', icon: MessageSquare },
    ],
    staff: [
      { label: 'Dashboard', path: '', icon: LayoutDashboard },
      { label: 'Assets', path: '/assets', icon: Package },
      { label: 'Scan QR', path: '/scan', icon: Scan },
      { label: 'Maintenance', path: '/maintenance', icon: Wrench },
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Feedback', path: '/feedback', icon: MessageSquare },
    ],
  }

export function Sidebar({
  basePath,
  role,
}: {
  basePath: string
  role: UserRole
}) {
  const pathname = usePathname()
  const menu = menus[role] ?? menus.staff

  return (
    <aside className="w-full md:sticky md:top-0 md:h-screen md:w-64 border-b md:border-r bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="px-4 py-4 md:py-6">
        <div className="flex items-center justify-between md:block">
          <h2 className="text-base font-semibold tracking-tight">
            ICT Asset System
          </h2>
          <span className="hidden md:block text-xs text-muted-foreground">
            Operations
          </span>
        </div>
      </div>

      <nav className="flex md:flex-col gap-1 px-2 pb-4 md:px-3 md:pb-6 overflow-x-auto md:overflow-y-auto md:overflow-x-visible md:max-h-[calc(100vh-5.5rem)]">
        {menu.map(item => {
          const href = `${basePath}${item.path}`
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground whitespace-nowrap',
                pathname === href && 'bg-muted text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
