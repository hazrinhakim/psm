import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SonnerNotifier } from '@/components/ui/sonner-notifier'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { updateMaintenanceStatus } from '@/lib/maintenanceActions'
import { Search, Wrench } from 'lucide-react'

type SearchParams = {
  updated?: string
  error?: string
  q?: string
  status?: string
}

export async function MaintenanceList({
  basePath,
  searchParams,
}: {
  basePath: string
  searchParams?: SearchParams
}) {
  let errorMessage: string | null = null
  if (searchParams?.error) {
    try {
      errorMessage = decodeURIComponent(searchParams.error)
    } catch {
      errorMessage = searchParams.error
    }
  }

  const query = (searchParams?.q ?? '').trim().toLowerCase()
  const statusFilter = (searchParams?.status ?? 'all').trim()

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const { data: requests } = await supabase
    .from('maintenance_requests')
    .select(
      `
      id,
      title,
      description,
      status,
      created_at,
      profiles ( full_name )
    `
    )
    .order('created_at', { ascending: false })

  const allRequests = requests ?? []
  const filteredRequests = allRequests.filter((request: any) => {
    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter
    if (!matchesStatus) {
      return false
    }
    if (!query) {
      return true
    }
    const haystack = [
      request.title,
      request.description,
      request.profiles?.full_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })

  const totalCount = allRequests.length
  const pendingCount = allRequests.filter(
    (request: any) => request.status === 'pending'
  ).length
  const inProgressCount = allRequests.filter(
    (request: any) => request.status === 'in_progress'
  ).length
  const completedCount = allRequests.filter(
    (request: any) => request.status === 'completed'
  ).length

  const displayName = profile?.full_name ?? 'Admin User'

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Maintenance
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {displayName}
        </p>
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Maintenance Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Review and manage maintenance requests.
        </p>
      </div>

      {(searchParams?.updated || searchParams?.error) && (
        <SonnerNotifier
          title={searchParams?.error ? 'Action needed' : 'Status updated'}
          message={
            searchParams?.error
              ? errorMessage || 'Unable to update maintenance status.'
              : 'Maintenance status updated successfully.'
          }
          variant={searchParams?.error ? 'error' : 'success'}
          toastId={`maintenance-${searchParams?.error ? 'error' : 'updated'}`}
        />
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">
              {totalCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-red-500">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-blue-600">
              {inProgressCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-emerald-600">
              {completedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form
            method="get"
            action={basePath + '/maintenance'}
            className="flex flex-col gap-3 lg:flex-row lg:items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search requests..."
                defaultValue={query}
                className="h-11 rounded-full border-muted pl-11 pr-4 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-0"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                name="status"
                className="h-11 rounded-full border border-input bg-background px-4 text-sm"
                defaultValue={statusFilter}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex items-center gap-2">
                <Button type="submit" className="h-11 rounded-full gap-2">
                  <Search className="h-4 w-4" />
                  Filter
                </Button>
                <Button asChild variant="ghost" className="h-11 rounded-full">
                  <a href={basePath + '/maintenance'}>Clear</a>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredRequests.map((r: any) => (
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
                {String(r.status ?? '').replace('_', ' ')}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {r.description}
              <form
                action={updateMaintenanceStatus}
                className="mt-4 flex flex-wrap items-center gap-2 text-sm"
              >
                <input
                  type="hidden"
                  name="redirectTo"
                  value={basePath + '/maintenance'}
                />
                <input type="hidden" name="id" value={r.id} />
                <select
                  name="status"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue={r.status ?? 'pending'}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <Button type="submit" variant="outline" size="sm">
                  Update status
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="rounded-xl border border-dashed bg-muted/20 py-16 text-center text-sm text-muted-foreground">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Wrench className="h-5 w-5" />
          </div>
          <p className="mt-3">No maintenance requests found</p>
        </div>
      )}
    </div>
  )
}
