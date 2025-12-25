'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Wrench,
  Package
} from 'lucide-react'

const menu = [
  { label: 'Dashboard', path: '', icon: LayoutDashboard },
  { label: 'Assets', path: '/assets', icon: Package },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench },
]

export function Sidebar({ basePath }: { basePath: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-white p-4">
      <h2 className="text-lg font-semibold mb-6">
        ICT Asset System
      </h2>

      <nav className="space-y-1">
        {menu.map(item => {
          const href = `${basePath}${item.path}`
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-100',
                pathname === href && 'bg-slate-100 font-medium'
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
