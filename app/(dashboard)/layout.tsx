import { FloatingAiAssistant } from '@/components/dashboard/FloatingAiAssistant'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SiteHeader } from '@/components/dashboard/SiteHeader'
import { PageTransition } from '@/components/ui/page-transition'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getCurrentUserContext } from '@/lib/currentUser'
import type { ReactNode } from 'react'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const { role, basePath, profileName } = await getCurrentUserContext()

  return (
    <SidebarProvider className="bg-muted/50">
      <Sidebar basePath={basePath} role={role} profileName={profileName} />
      <SidebarInset className="bg-sidebar p-3">
        <div className="flex min-h-[calc(100svh-1rem)] flex-1 flex-col rounded-xl border bg-card shadow-sm">
          <SiteHeader />
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto w-full max-w-6xl">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </SidebarInset>
      <FloatingAiAssistant />
    </SidebarProvider>
  )
}
