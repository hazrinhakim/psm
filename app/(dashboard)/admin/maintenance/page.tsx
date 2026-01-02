import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Maintenance Requests
        </h1>
        <p className="text-sm text-muted-foreground">
          Track and review reported issues from staff.
        </p>
      </div>

      {!requests?.length && (
        <p className="text-sm text-muted-foreground">
          No maintenance requests yet.
        </p>
      )}

      <div className="grid gap-4">
        {requests?.map((r: any) => (
          <Card key={r.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  {r.title}
                </CardTitle>
                <CardDescription>
                  Requested by {r.profiles?.full_name ?? 'Unknown'}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="capitalize">
                {r.status}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {r.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
