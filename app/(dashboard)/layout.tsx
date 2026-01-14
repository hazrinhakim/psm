import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { normalizeRole, roleToPath } from '@/lib/roles'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()
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
    <SidebarProvider className="bg-slate-50">
      <Sidebar basePath={basePath} role={role} />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
