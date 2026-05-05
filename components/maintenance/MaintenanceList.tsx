import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SonnerNotifier } from '@/components/ui/sonner-notifier'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { AnimatedCount } from '@/components/assets/AnimatedCount'
import { MaintenanceFilterForm } from '@/components/maintenance/MaintenanceFilterForm'
import { MaintenanceUpdateForm } from '@/components/maintenance/MaintenanceUpdateForm'
import {
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

function getDefaultProgressStep(status?: string | null) {
  const normalized = normalizeStatus(status)
  if (normalized === 'in_progress') return 'In Progress'
  if (normalized === 'resolved') return 'Resolved'
  return 'Received by Admin'
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
    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
  }

  if (status === 'in_progress') {
    return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200'
  }

  if (status === 'resolved') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
  }

  return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200'
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

  const supabase = await createSupabaseServerClient()

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
      iconClass:
        'border border-violet-200/70 bg-violet-100/50 text-violet-600 dark:border-violet-500/15 dark:bg-violet-500/12 dark:text-violet-300',
    },
    {
      label: 'Pending',
      count: pendingCount,
      icon: Clock3,
      iconClass:
        'border border-rose-200/70 bg-rose-100/50 text-rose-600 dark:border-rose-500/15 dark:bg-rose-500/12 dark:text-rose-300',
    },
    {
      label: 'In Progress',
      count: inProgressCount,
      icon: LoaderCircle,
      iconClass:
        'border border-blue-200/70 bg-blue-100/55 text-blue-600 dark:border-blue-500/15 dark:bg-blue-500/12 dark:text-blue-300',
    },
    {
      label: 'Resolved',
      count: resolvedCount,
      icon: CheckCircle2,
      iconClass:
        'border border-emerald-200/70 bg-emerald-100/50 text-emerald-600 dark:border-emerald-500/15 dark:bg-emerald-500/12 dark:text-emerald-300',
    },
  ]

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Maintenance Request Management
        </h2>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(summary => {
          const Icon = summary.icon

          return (
            <Card key={summary.label} className="border-border/70 shadow-none">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-semibold tracking-tight text-foreground">
                      <AnimatedCount value={summary.count} />
                    </div>

                    <p className="mt-2 text-sm font-medium text-foreground">
                      {summary.label}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      Maintenance overview
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${summary.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <MaintenanceFilterForm
        action={basePath + '/maintenance'}
        defaultQuery={query}
        defaultStatus={selectedStatus}
      />

      <div className="grid gap-4">
        {filteredRequests.map((r: MaintenanceRequest) => (
          <Card
            key={r.id}
            className="border-border/70 shadow-none"
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

              <MaintenanceUpdateForm
                id={r.id}
                redirectTo={basePath + '/maintenance'}
                defaultProgressStep={getDefaultProgressStep(r.status)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-muted/20 py-16 text-center text-sm text-muted-foreground">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Wrench className="h-5 w-5" />
          </div>
          <p className="mt-3">No maintenance requests found</p>
        </div>
      )}
    </div>
  )
}
