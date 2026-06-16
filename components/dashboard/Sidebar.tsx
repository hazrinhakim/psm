'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Wrench,
  Package,
  Users,
  QrCode,
  Bell,
  MessageSquare,
  FileBarChart,
  LogOut,
  Bot,
} from 'lucide-react'
import type { UserRole } from '@/lib/roles'
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabaseClient'
import { getUserSafely, navigateAfterAuthChange } from '@/lib/supabaseAuth'

import type { LucideIcon } from 'lucide-react'

const menus: Record<
  UserRole,
  { label: string; path: string; icon: LucideIcon }[]
> =
  {
    admin: [
      { label: 'Dashboard', path: '', icon: LayoutDashboard },
      { label: 'Users Management', path: '/users', icon: Users },
      { label: 'Assets Management', path: '/assets', icon: Package },
      { label: 'QR Codes Management', path: '/qr', icon: QrCode },
      { label: 'Maintenance Request', path: '/maintenance', icon: Wrench },
      { label: 'Feedback Management', path: '/feedback', icon: MessageSquare },
      { label: 'Reports & Analytics', path: '/reports', icon: FileBarChart },
      { label: 'AI Assistant', path: '/chatbot', icon: Bot },
    ],
    admin_assistant: [
      { label: 'Dashboard', path: '', icon: LayoutDashboard },
      { label: 'Assets Management', path: '/assets', icon: Package },
      { label: 'QR Codes Management', path: '/qr', icon: QrCode },
      { label: 'Maintenance Request', path: '/maintenance', icon: Wrench },
      { label: 'Feedback Management', path: '/feedback', icon: MessageSquare },
      { label: 'Reports & Analytics', path: '/reports', icon: FileBarChart },
      { label: 'AI Assistant', path: '/chatbot', icon: Bot },
    ],
    staff: [
      { label: 'Dashboard', path: '', icon: LayoutDashboard },
      { label: 'Assets Management', path: '/assets', icon: Package },
      { label: 'Maintenance Request', path: '/maintenance', icon: Wrench },
      { label: 'Feedback Management', path: '/feedback', icon: MessageSquare },
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'AI Assistant', path: '/chatbot', icon: Bot },
    ],
  }

const badgeLabelMap: Record<string, string> = {
  admin: 'Admin Portal',
  admin_assistant: 'Admin Assistant Portal',
  staff: 'Staff',
}

const badgeClassMap: Record<string, string> = {
  admin:
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-500/30',
  admin_assistant:
    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-200 dark:border-purple-500/30',
  staff:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/30',
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
  const [profileName, setProfileName] = useState<string>('User')
  const [profileRole, setProfileRole] = useState<string>(role)
  const portalLabel = badgeLabelMap[profileRole] ?? 'Staff'
  const portalClass = badgeClassMap[profileRole] ?? badgeClassMap.staff

  useEffect(() => {
    let isActive = true

    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await getUserSafely()

        if (!user) {
          return
        }

        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle()

        if (isActive) {
          setProfileName(data?.full_name ?? user.email ?? 'User')
          setProfileRole(data?.role ?? role)
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      }
    }

    void loadProfile()

    return () => {
      isActive = false
    }
  }, [role])

  const logout = async () => {
    await supabase.auth.signOut()
    await navigateAfterAuthChange('/login')
  }

  return (
    <SidebarRoot collapsible="offcanvas" className="border-none">
      <SidebarHeader className="p-4 pt-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-24 items-center justify-center overflow-hidden sm:w-28">
            <Image
              src="/icamsrbg.png"
              alt="ICT"
              width={100}
              height={24}
              className="h-full w-full object-cover"
            />
          </span>
          <Badge
            variant="outline"
            className={`h-5 rounded-full px-2 text-[9px] font-medium ${portalClass} group-data-[collapsible=icon]:hidden`}
          >
            {portalLabel}
          </Badge>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pb-4">
        <SidebarMenu>
          {menu.map(item => {
            const href = item.path === '/chatbot' ? item.path : `${basePath}${item.path}`
            const Icon = item.icon
            const isActive = pathname === href

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link href={href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator className="mx-0 border" />
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted text-sm font-semibold text-foreground">
            {profileName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {profileName}
            </p>
            <p className="text-xs capitalize text-muted-foreground">
              {profileRole.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="mt-3 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="h-10 w-full justify-start gap-2 border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700 hover:text-white dark:border-red-500/70 dark:bg-red-500/80 dark:hover:border-red-500 dark:hover:bg-red-500 group-data-[collapsible=icon]:justify-center text-center"
          >
            <LogOut className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">
              Logout
            </span>
          </Button>

        </div>
      </SidebarFooter>
    </SidebarRoot>
  )
}
