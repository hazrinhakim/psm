import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function AdminMaintenancePage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: requests } = await supabase
    .from('maintenance_requests')
    .select(`
      id,
      title,
      description,
      status,
      created_at,
      profiles ( full_name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Maintenance Requests
      </h1>

      {!requests?.length && (
        <p className="text-sm text-slate-500">
          No maintenance requests yet.
        </p>
      )}

      {requests?.map((r: any) => (
        <Card key={r.id} className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{r.title}</h3>
            <Badge>{r.status}</Badge>
          </div>

          <p className="text-sm text-slate-600">
            {r.description}
          </p>

          <p className="text-xs text-slate-400">
            Requested by: {r.profiles?.full_name}
          </p>
        </Card>
      ))}
    </div>
  )
}
