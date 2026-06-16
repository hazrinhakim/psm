import { FloatingAiAssistant } from '@/components/dashboard/FloatingAiAssistant'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SiteHeader } from '@/components/dashboard/SiteHeader'
import { PageTransition } from '@/components/ui/page-transition'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { normalizeRole, roleToPath } from '@/lib/roles'
import type { ReactNode } from 'react'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = user
    ? await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const role = normalizeRole(data?.role)
  const basePath = roleToPath(role)

  return (
    <SidebarProvider className="bg-muted/50">
      <Sidebar basePath={basePath} role={role} />
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
