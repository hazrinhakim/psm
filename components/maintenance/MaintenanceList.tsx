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
import { AnimatedCount } from '@/components/assets/AnimatedCount'
import {
  Search,
  Wrench,
  ClipboardList,
  Clock3,
  LoaderCircle,
  CheckCircle2,
} from 'lucide-react'

type SearchParams = {
  updated?: string
  error?: string
  q?: string | string[]
  status?: string | string[]
}

type MaintenanceRequest = {
  id: string
  title?: string | null
  description?: string | null
  status?: string | null
  created_at?: string | null
  requested_by?: {
    full_name?: string | null
  } | null
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function normalizeStatus(value?: string | null) {
  const raw = String(value ?? '').trim().toLowerCase()

  if (raw === 'pending') return 'pending'
  if (raw === 'in progress') return 'in_progress'
  if (raw === 'in_progress') return 'in_progress'
  if (raw === 'resolved') return 'resolved'
  if (raw === 'completed') return 'resolved'

  return 'unknown'
}

function getStatusLabel(value?: string | null) {
  const status = normalizeStatus(value)

  if (status === 'pending') return 'Pending'
  if (status === 'in_progress') return 'In Progress'
  if (status === 'resolved') return 'Resolved'
  return 'Unknown'
}

function getStatusBadgeClass(value?: string | null) {
  const status = normalizeStatus(value)

  if (status === 'pending') {
    return 'bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 border-rose-200 shadow-sm'
  }

  if (status === 'in_progress') {
    return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200 shadow-sm'
  }

  if (status === 'resolved') {
    return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
  }

  return 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border-slate-200 shadow-sm'
}

function getStatusValue(value?: string | null) {
  const status = normalizeStatus(value)

  if (status === 'pending') return 'Pending'
  if (status === 'in_progress') return 'In Progress'
  if (status === 'resolved') return 'Resolved'

  return 'Pending'
}

function normalizeStatusParam(value: string) {
  const raw = value.trim().toLowerCase()

  if (!raw || raw === 'all') return 'all'
  if (raw === 'pending') return 'pending'
  if (raw === 'in progress' || raw === 'in_progress') return 'in_progress'
  if (raw === 'resolved') return 'resolved'

  return 'all'
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

  const query = getParamValue(searchParams?.q).trim().toLowerCase()
  const statusParam = getParamValue(searchParams?.status)
  const selectedStatus = normalizeStatusParam(statusParam)

  const supabase = createSupabaseServerClient()

  const { data: requests } = await supabase
    .from('maintenance_requests')
    .select(
      `
      id,
      title,
      description,
      status,
      created_at,
      requested_by:profiles ( full_name )
    `
    )
    .order('created_at', { ascending: false })

  const allRequests = (requests ?? []) as MaintenanceRequest[]

  const filteredRequests = allRequests.filter((request) => {
    const matchesStatus =
      selectedStatus === 'all' ||
      normalizeStatus(request.status) === selectedStatus

    const requesterName =
      request.requested_by?.full_name ?? 'Unknown'
    const matchesRequester =
      !query || requesterName.toLowerCase().includes(query)

    return matchesStatus && matchesRequester
  })

  const totalCount = allRequests.length
  const pendingCount = allRequests.filter(
    (request) => normalizeStatus(request.status) === 'pending'
  ).length
  const inProgressCount = allRequests.filter(
    (request) => normalizeStatus(request.status) === 'in_progress'
  ).length
  const resolvedCount = allRequests.filter(
    (request) => normalizeStatus(request.status) === 'resolved'
  ).length

  const getRequesterName = (request: MaintenanceRequest) =>
    request.requested_by?.full_name ?? 'Unknown'

  const summaryCards = [
    {
      label: 'Total Requests',
      count: totalCount,
      icon: ClipboardList,
      accentColor: 'from-violet-400 to-violet-300',
    },
    {
      label: 'Pending',
      count: pendingCount,
      icon: Clock3,
      accentColor: 'from-rose-400 to-rose-300',
    },
    {
      label: 'In Progress',
      count: inProgressCount,
      icon: LoaderCircle,
      accentColor: 'from-blue-400 to-blue-300',
    },
    {
      label: 'Resolved',
      count: resolvedCount,
      icon: CheckCircle2,
      accentColor: 'from-emerald-400 to-emerald-300',
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="space-y-1 animate-in slide-in-from-left-4 duration-700">
        <h2 className="text-lg font-semibold tracking-tight">
          Maintenance Request Management
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

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 animate-in slide-in-from-bottom-4 duration-700">
        {summaryCards.map((summary, index) => {
          const Icon = summary.icon

          return (
            <Card
              key={summary.label}
              className="group relative overflow-hidden border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${summary.accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              />

              <CardContent className="pt-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold tracking-tight text-gray-900">
                      <AnimatedCount value={summary.count} />
                    </div>

                    <p className="text-sm font-semibold text-gray-700 mt-2">
                      {summary.label}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      Maintenance overview
                    </p>
                  </div>

                  <div
                    className={`
                      relative flex h-14 w-14 items-center justify-center
                      rounded-2xl bg-gradient-to-br ${summary.accentColor}
                      shadow-lg shadow-black/10
                      group-hover:scale-110 group-hover:rotate-6
                      transition-all duration-300
                    `}
                  >
                    <Icon className="h-7 w-7 text-white drop-shadow-sm" />
                    <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                  </div>
                </div>

                <div
                  className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${summary.accentColor} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <form
        method="get"
        action={basePath + '/maintenance'}
        className="flex flex-col gap-3 lg:flex-row lg:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search by requester..."
            defaultValue={query}
            className="h-11 rounded-full border-muted pl-11 pr-4 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            name="status"
            className="h-11 rounded-full border border-input bg-background px-4 text-sm"
            defaultValue={
              selectedStatus === 'pending'
                ? 'Pending'
                : selectedStatus === 'in_progress'
                ? 'In Progress'
                : selectedStatus === 'resolved'
                ? 'Resolved'
                : 'all'
            }
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
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

      <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
        {filteredRequests.map((r: MaintenanceRequest) => (
          <Card
            key={r.id}
            className="border-2 border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base">{r.title}</CardTitle>
                <CardDescription>
                  Requested by {getRequesterName(r)}
                </CardDescription>
              </div>

              <Badge className={`${getStatusBadgeClass(r.status)} capitalize`}>
                {getStatusLabel(r.status)}
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
                  defaultValue={getStatusValue(r.status)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
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
