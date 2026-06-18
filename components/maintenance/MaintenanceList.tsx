import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SonnerNotifier } from '@/components/ui/sonner-notifier'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { normalizeRole } from '@/lib/roles'
import { AnimatedCount } from '@/components/assets/AnimatedCount'
import { MaintenanceFilterForm } from '@/components/maintenance/MaintenanceFilterForm'
import { MaintenanceSchedulerTrigger } from '@/components/maintenance/MaintenanceSchedulerTrigger'
import { MaintenanceUpdateForm } from '@/components/maintenance/MaintenanceUpdateForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Wrench,
  ClipboardList,
  Clock3,
  LoaderCircle,
  CheckCircle2,
  CalendarClock,
  Siren,
  ShieldAlert,
  SquarePen,
} from 'lucide-react'

type SearchParams = {
  updated?: string
  error?: string
  q?: string | string[]
  status?: string | string[]
  saved?: string | string[]
  requestType?: string | string[]
  urgency?: string | string[]
}

type MaintenanceRequest = {
  id: string
  title?: string | null
  description?: string | null
  status?: string | null
  priority?: string | null
  request_type?: string | null
  due_date?: string | null
  created_at?: string | null
  requested_by?: {
    full_name?: string | null
  } | null
  assets?:
    | {
        asset_no?: string | null
        asset_name?: string | null
      }
    | {
        asset_no?: string | null
        asset_name?: string | null
      }[]
    | null
}

type RawMaintenanceRequest = {
  id: string
  title?: string | null
  description?: string | null
  status?: string | null
  priority?: string | null
  request_type?: string | null
  due_date?: string | null
  created_at?: string | null
  requested_by?: string | null
  asset_id?: string | null
}

type AssetOption = {
  id: string
  asset_no?: string | null
  asset_name?: string | null
  next_service_date?: string | null
}

type DueAsset = {
  asset_id: string
  asset_no?: string | null
  asset_name?: string | null
  department?: string | null
  unit?: string | null
  maintenance_priority?: string | null
  next_service_date?: string | null
  service_state?: string | null
  days_until_service?: number | null
}

type ScheduleDashboardItem = {
  id: string
  asset_id: string
  asset_no?: string | null
  asset_name?: string | null
  title: string
  maintenance_type?: string | null
  priority?: string | null
  next_due_date?: string | null
  reminder_days_before?: number | null
  auto_create_request?: boolean | null
  schedule_state?: string | null
  days_until_due?: number | null
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

function normalizePriority(value?: string | null) {
  const raw = String(value ?? '').trim().toLowerCase()
  if (raw === 'low') return 'low'
  if (raw === 'high') return 'high'
  if (raw === 'critical') return 'critical'
  return 'medium'
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

function getPriorityBadgeClass(value?: string | null) {
  const priority = normalizePriority(value)

  if (priority === 'critical') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
  }

  if (priority === 'high') {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
  }

  if (priority === 'low') {
    return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200'
  }

  return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200'
}

function getScheduleStateBadgeClass(value?: string | null) {
  const normalized = String(value ?? '').trim().toLowerCase()

  if (normalized === 'overdue') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
  }

  if (normalized === 'due_soon') {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
}

function normalizeStatusParam(value: string) {
  const raw = value.trim().toLowerCase()

  if (!raw || raw === 'all') return 'all'
  if (raw === 'pending') return 'pending'
  if (raw === 'in progress' || raw === 'in_progress') return 'in_progress'
  if (raw === 'resolved') return 'resolved'

  return 'all'
}

function normalizeRequestTypeParam(value: string) {
  const raw = value.trim().toLowerCase()
  if (!raw || raw === 'all') return 'all'
  if (raw === 'preventive') return 'preventive'
  return 'corrective'
}

function normalizeUrgencyParam(value: string) {
  const raw = value.trim().toLowerCase()
  if (!raw || raw === 'all') return 'all'
  if (raw === 'due_soon') return 'due_soon'
  if (raw === 'overdue') return 'overdue'
  return 'all'
}

function getRequestTypeLabel(value?: string | null) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'preventive') return 'Preventive'
  if (normalized === 'inspection') return 'Inspection'
  return 'Corrective'
}

function getRequestTypeBadgeClass(value?: string | null) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'preventive') {
    return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200'
  }

  if (normalized === 'inspection') {
    return 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200'
  }

  return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200'
}

function formatDate(value?: string | null) {
  if (!value) return 'Not set'

  return new Date(`${value}T00:00:00`).toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getDaysLabel(days?: number | null) {
  if (days === null || days === undefined) return 'No due date'
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`
  if (days === 0) return 'Due today'
  return `Due in ${days} day${days === 1 ? '' : 's'}`
}

function getAssetMeta(asset?: MaintenanceRequest['assets']) {
  const normalized = Array.isArray(asset) ? asset[0] : asset
  return normalized ?? null
}

function getUrgencyState(value?: string | null, status?: string | null) {
  const normalizedStatus = normalizeStatus(status)
  if (normalizedStatus === 'resolved') return 'all_clear'
  if (!value) return 'normal'

  const dueDate = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(dueDate.getTime())) return 'normal'

  const today = new Date()
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  )
  const dueUtc = Date.UTC(
    dueDate.getUTCFullYear(),
    dueDate.getUTCMonth(),
    dueDate.getUTCDate()
  )
  const diffDays = Math.floor((dueUtc - todayUtc) / 86400000)

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 7) return 'due_soon'
  return 'normal'
}

function getSavedMessage() {
  return {
    title: 'Schedule saved',
    message: 'Preventive maintenance schedule saved successfully.',
  }
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
  const requestTypeParam = getParamValue(searchParams?.requestType)
  const selectedRequestType = normalizeRequestTypeParam(requestTypeParam)
  const urgencyParam = getParamValue(searchParams?.urgency)
  const selectedUrgency = normalizeUrgencyParam(urgencyParam)

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const role = normalizeRole(profile?.role)
  const adminClient =
    role === 'admin' || role === 'admin_assistant'
      ? createSupabaseAdminClient()
      : null
  const dataClient = adminClient ?? supabase

  const [
    { data: rawRequests },
    { data: dueAssets },
    { data: activeSchedules },
    { data: assets },
  ] =
    await Promise.all([
      dataClient
        .from('maintenance_requests')
        .select(
          `
          id,
          title,
          description,
          status,
          priority,
          request_type,
          due_date,
          created_at,
          requested_by,
          asset_id
        `
        )
        .order('created_at', { ascending: false }),
      dataClient
        .from('v_assets_due_for_maintenance')
        .select(
          'asset_id, asset_no, asset_name, department, unit, maintenance_priority, next_service_date, service_state, days_until_service'
        )
        .order('next_service_date', { ascending: true })
        .limit(8),
      dataClient
        .from('v_maintenance_schedule_dashboard')
        .select(
          'id, asset_id, asset_no, asset_name, title, maintenance_type, priority, next_due_date, reminder_days_before, auto_create_request, schedule_state, days_until_due'
        )
        .order('next_due_date', { ascending: true })
        .limit(8),
      dataClient
        .from('assets')
        .select('id, asset_no, asset_name, next_service_date')
        .order('asset_name'),
    ])

  const baseRequests = (rawRequests ?? []) as RawMaintenanceRequest[]
  const dueAssetList = (dueAssets ?? []) as DueAsset[]
  const activeScheduleList = (activeSchedules ?? []) as ScheduleDashboardItem[]
  const assetOptions = (assets ?? []) as AssetOption[]
  const requesterIds = Array.from(
    new Set(
      baseRequests
        .map(request => request.requested_by)
        .filter((value): value is string => Boolean(value))
    )
  )
  const requestAssetIds = Array.from(
    new Set(
      baseRequests
        .map(request => request.asset_id)
        .filter((value): value is string => Boolean(value))
    )
  )

  const [{ data: requesterProfiles }, { data: requestAssets }] = await Promise.all([
    requesterIds.length > 0
      ? dataClient.from('profiles').select('id, full_name').in('id', requesterIds)
      : Promise.resolve({ data: [] }),
    requestAssetIds.length > 0
      ? dataClient
          .from('assets')
          .select('id, asset_no, asset_name')
          .in('id', requestAssetIds)
      : Promise.resolve({ data: [] }),
  ])

  const requesterMap = new Map(
    (requesterProfiles ?? []).map(profile => [profile.id, profile.full_name ?? null])
  )
  const assetMap = new Map(
    (requestAssets ?? []).map(asset => [
      asset.id,
      {
        asset_no: asset.asset_no ?? null,
        asset_name: asset.asset_name ?? null,
      },
    ])
  )
  const allRequests = baseRequests.map<MaintenanceRequest>(request => ({
    id: request.id,
    title: request.title ?? null,
    description: request.description ?? null,
    status: request.status ?? null,
    priority: request.priority ?? null,
    request_type: request.request_type ?? null,
    due_date: request.due_date ?? null,
    created_at: request.created_at ?? null,
    requested_by: {
      full_name: request.requested_by
        ? (requesterMap.get(request.requested_by) ?? null)
        : null,
    },
    assets: request.asset_id ? (assetMap.get(request.asset_id) ?? null) : null,
  }))
  const filteredRequests = allRequests.filter(request => {
    const matchesStatus =
      selectedStatus === 'all' ||
      normalizeStatus(request.status) === selectedStatus
    const normalizedRequestType = String(
      request.request_type ?? 'corrective'
    ).trim().toLowerCase()
    const matchesType =
      selectedRequestType === 'all' ||
      normalizedRequestType === selectedRequestType
    const urgencyState = getUrgencyState(request.due_date, request.status)
    const matchesUrgency =
      selectedUrgency === 'all' || urgencyState === selectedUrgency

    const requesterName = request.requested_by?.full_name ?? 'Unknown'
    const assetMeta = getAssetMeta(request.assets)
    const haystack = [
      requesterName,
      request.title ?? '',
      request.description ?? '',
      assetMeta?.asset_no ?? '',
      assetMeta?.asset_name ?? '',
      request.request_type ?? '',
    ]
      .join(' ')
      .toLowerCase()

    const matchesQuery = !query || haystack.includes(query)
    return matchesStatus && matchesType && matchesUrgency && matchesQuery
  })

  const totalCount = allRequests.length
  const pendingCount = allRequests.filter(
    request => normalizeStatus(request.status) === 'pending'
  ).length
  const inProgressCount = allRequests.filter(
    request => normalizeStatus(request.status) === 'in_progress'
  ).length
  const resolvedCount = allRequests.filter(
    request => normalizeStatus(request.status) === 'resolved'
  ).length

  const overdueAssets = dueAssetList.filter(asset => asset.service_state === 'overdue')
  const dueSoonAssets = dueAssetList.filter(asset => asset.service_state === 'due_soon')
  const resolvedRequests = allRequests.filter(
    request => normalizeStatus(request.status) === 'resolved'
  )
  const activeRequests = filteredRequests.filter(
    request => normalizeStatus(request.status) !== 'resolved'
  )
  const urgentRequests = filteredRequests
    .filter(request => {
      const status = normalizeStatus(request.status)
      const priority = normalizePriority(request.priority)
      const urgency = getUrgencyState(request.due_date, request.status)

      return (
        status !== 'resolved' &&
        (priority === 'critical' || priority === 'high' || urgency === 'overdue')
      )
    })
    .slice(0, 4)

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

  const scheduleSummaryCards = [
    {
      label: 'Overdue Assets',
      count: overdueAssets.length,
      icon: ShieldAlert,
      iconClass:
        'border border-red-200/70 bg-red-100/50 text-red-600 dark:border-red-500/15 dark:bg-red-500/12 dark:text-red-300',
    },
    {
      label: 'Due Soon',
      count: dueSoonAssets.length,
      icon: Siren,
      iconClass:
        'border border-amber-200/70 bg-amber-100/50 text-amber-600 dark:border-amber-500/15 dark:bg-amber-500/12 dark:text-amber-300',
    },
    {
      label: 'Active Schedules',
      count: activeScheduleList.length,
      icon: CalendarClock,
      iconClass:
        'border border-sky-200/70 bg-sky-100/50 text-sky-600 dark:border-sky-500/15 dark:bg-sky-500/12 dark:text-sky-300',
    },
  ]

  return (
    <div className="space-y-6 p-1">
      <MaintenanceSchedulerTrigger />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Maintenance Request Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage corrective requests and configure preventive servicing from one place.
        </p>
      </div>

      {(searchParams?.updated || searchParams?.error || searchParams?.saved) && (
        <SonnerNotifier
          title={
            searchParams?.error
                ? 'Action needed'
                : searchParams?.saved
                ? getSavedMessage().title
                : 'Status updated'
          }
          message={
            searchParams?.error
              ? errorMessage || 'Unable to complete the maintenance action.'
              : searchParams?.saved
                ? getSavedMessage().message
                : 'Maintenance status updated successfully.'
          }
          variant={searchParams?.error ? 'error' : 'success'}
          toastId={`maintenance-${searchParams?.error ? 'error' : searchParams?.saved ? 'saved' : 'updated'}`}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(summary => {
          const Icon = summary.icon

          return (
            <Card key={summary.label} className="border-border/70 shadow-none">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-3xl font-semibold tracking-tight text-foreground">
                      <AnimatedCount value={summary.count} />
                    </div>

                    <p className="mt-2 text-sm font-medium text-foreground">
                      {summary.label}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Corrective maintenance overview
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${summary.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="scrollbar-hidden flex h-auto w-full min-w-0 justify-start snap-x snap-mandatory gap-1 overflow-x-auto overflow-y-hidden rounded-2xl border border-border/70 bg-muted/30 p-1 touch-pan-x sm:flex-wrap sm:overflow-visible">
          <TabsTrigger value="overview" className="min-w-[116px] snap-start flex-none sm:min-w-0 sm:flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="requests" className="min-w-[116px] snap-start flex-none sm:min-w-0 sm:flex-1">
            Requests
          </TabsTrigger>
          <TabsTrigger value="schedules" className="min-w-[116px] snap-start flex-none sm:min-w-0 sm:flex-1">
            Schedules
          </TabsTrigger>
          <TabsTrigger value="history" className="min-w-[116px] snap-start flex-none sm:min-w-0 sm:flex-1">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-border/70 shadow-none">
              <CardHeader>
                <CardTitle>Preventive Maintenance Monitoring</CardTitle>
                <CardDescription>
                  Maintenance settings are now captured in asset register and update forms. This page tracks what needs action.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Use the asset module to manage:
                  <span className="ml-1 text-foreground">
                    strategy, interval, next service date, warranty, and maintenance notes.
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {assetOptions.slice(0, 6).map(asset => (
                    <div
                      key={asset.id}
                      className="rounded-xl border border-border/70 px-4 py-3"
                    >
                      <p className="font-medium text-foreground">
                        {asset.asset_name ?? asset.asset_no ?? 'Unnamed asset'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {asset.asset_no ?? 'No asset ID'}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Next service: {formatDate(asset.next_service_date)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {scheduleSummaryCards.map(summary => {
                  const Icon = summary.icon

                  return (
                    <Card key={summary.label} className="border-border/70 shadow-none">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-3xl font-semibold tracking-tight text-foreground">
                              <AnimatedCount value={summary.count} />
                            </div>
                            <p className="mt-2 text-sm font-medium text-foreground">
                              {summary.label}
                            </p>
                          </div>
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${summary.iconClass}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Card className="border-border/70 shadow-none">
                <CardHeader>
                  <CardTitle>Needs Immediate Action</CardTitle>
                  <CardDescription>
                    Priority corrective and overdue items surfaced first for admin review.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {urgentRequests.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
                      No urgent requests found for the current filter.
                    </div>
                  ) : (
                    urgentRequests.map(request => {
                      const assetMeta = getAssetMeta(request.assets)

                      return (
                        <div
                          key={request.id}
                          className="rounded-xl border border-border/70 px-4 py-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">
                                {request.title ?? 'Untitled request'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {[assetMeta?.asset_name, assetMeta?.asset_no]
                                  .filter(Boolean)
                                  .join(' · ') || 'No linked asset'}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={getPriorityBadgeClass(request.priority)}>
                                {normalizePriority(request.priority)}
                              </Badge>
                              <Badge className={`${getStatusBadgeClass(request.status)} capitalize`}>
                                {getStatusLabel(request.status)}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span>Type: {getRequestTypeLabel(request.request_type)}</span>
                            {request.due_date ? <span>Due: {formatDate(request.due_date)}</span> : null}
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/70 shadow-none">
              <CardContent className="pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Active Queue
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  <AnimatedCount value={activeRequests.length} />
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/70 shadow-none">
              <CardContent className="pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Filtered Urgent
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  <AnimatedCount value={urgentRequests.length} />
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/70 shadow-none">
              <CardContent className="pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Resolved Archive
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  <AnimatedCount value={resolvedRequests.length} />
                </p>
              </CardContent>
            </Card>
          </div>

          <MaintenanceFilterForm
            action={basePath + '/maintenance'}
            defaultQuery={query}
            defaultStatus={selectedStatus}
            defaultRequestType={selectedRequestType}
            defaultUrgency={selectedUrgency}
          />

          <div className="grid gap-4">
            {activeRequests.map(request => {
              const assetMeta = getAssetMeta(request.assets)

              return (
                <Card
                  key={request.id}
                  className="border-border/70 shadow-none"
                >
                  <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{request.title}</CardTitle>
                      <CardDescription>
                        Requested by {request.requested_by?.full_name ?? 'Unknown'}
                      </CardDescription>
                      {(assetMeta?.asset_name || assetMeta?.asset_no) && (
                        <p className="text-xs text-muted-foreground">
                          Asset: {[assetMeta?.asset_name, assetMeta?.asset_no]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {request.priority && (
                        <Badge className={getPriorityBadgeClass(request.priority)}>
                          {normalizePriority(request.priority)}
                        </Badge>
                      )}
                      <Badge className={getRequestTypeBadgeClass(request.request_type)}>
                        {getRequestTypeLabel(request.request_type)}
                      </Badge>
                      <Badge className={`${getStatusBadgeClass(request.status)} capitalize`}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {request.description}

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                      <span>Type: {getRequestTypeLabel(request.request_type)}</span>
                      {request.due_date && <span>Due: {formatDate(request.due_date)}</span>}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-full">
                            <SquarePen className="h-4 w-4" />
                            Update request
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-background sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Update maintenance request</DialogTitle>
                            <DialogDescription>
                              Review the request status, add notes, and complete service details only when needed.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="font-medium text-foreground">
                                  {request.title ?? 'Untitled request'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {[assetMeta?.asset_name, assetMeta?.asset_no]
                                    .filter(Boolean)
                                    .join(' · ') || 'No linked asset'}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {request.priority ? (
                                  <Badge className={getPriorityBadgeClass(request.priority)}>
                                    {normalizePriority(request.priority)}
                                  </Badge>
                                ) : null}
                                <Badge className={getRequestTypeBadgeClass(request.request_type)}>
                                  {getRequestTypeLabel(request.request_type)}
                                </Badge>
                                <Badge className={`${getStatusBadgeClass(request.status)} capitalize`}>
                                  {getStatusLabel(request.status)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <MaintenanceUpdateForm
                            id={request.id}
                            redirectTo={basePath + '/maintenance'}
                            defaultProgressStep={getDefaultProgressStep(request.status)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {activeRequests.length === 0 && (
            <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-muted/20 py-16 text-center text-sm text-muted-foreground">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Wrench className="h-5 w-5" />
              </div>
              <p className="mt-3">No active maintenance requests found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Assets Needing Action</CardTitle>
              <CardDescription>
                The nearest due items pulled from your preventive maintenance setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dueAssetList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
                  No due assets yet. Add a preventive schedule to start tracking.
                </div>
              ) : (
                dueAssetList.map(asset => (
                  <div
                    key={asset.asset_id}
                    className="rounded-xl border border-border/70 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {asset.asset_name ?? asset.asset_no ?? 'Unnamed asset'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[asset.asset_no, asset.department, asset.unit]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getScheduleStateBadgeClass(asset.service_state)}>
                          {asset.service_state === 'due_soon'
                            ? 'Due Soon'
                            : asset.service_state === 'overdue'
                              ? 'Overdue'
                              : 'Scheduled'}
                        </Badge>
                        <Badge className={getPriorityBadgeClass(asset.maintenance_priority)}>
                          {normalizePriority(asset.maintenance_priority)}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>Next service: {formatDate(asset.next_service_date)}</span>
                      <span>{getDaysLabel(asset.days_until_service)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Active Preventive Schedules</CardTitle>
              <CardDescription>
                Quick view of recurring schedules currently monitoring your assets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeScheduleList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
                  No active schedules found.
                </div>
              ) : (
                activeScheduleList.map(schedule => (
                  <div
                    key={schedule.id}
                    className="rounded-xl border border-border/70 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{schedule.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {[schedule.asset_name, schedule.asset_no, schedule.maintenance_type]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getScheduleStateBadgeClass(schedule.schedule_state)}>
                          {schedule.schedule_state === 'due_soon'
                            ? 'Due Soon'
                            : schedule.schedule_state === 'overdue'
                              ? 'Overdue'
                              : 'Scheduled'}
                        </Badge>
                        <Badge className={getPriorityBadgeClass(schedule.priority)}>
                          {normalizePriority(schedule.priority)}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>Next due: {formatDate(schedule.next_due_date)}</span>
                      <span>{getDaysLabel(schedule.days_until_due)}</span>
                      <span>Reminder: {schedule.reminder_days_before ?? 0} day(s) before</span>
                      <span>
                        Auto request: {schedule.auto_create_request ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle>Resolved Maintenance History</CardTitle>
              <CardDescription>
                Completed or closed requests separated from the active working queue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resolvedRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
                  No resolved maintenance history found yet.
                </div>
              ) : (
                resolvedRequests.map(request => {
                  const assetMeta = getAssetMeta(request.assets)

                  return (
                    <div
                      key={request.id}
                      className="rounded-xl border border-border/70 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {request.title ?? 'Untitled request'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[request.requested_by?.full_name, assetMeta?.asset_name, assetMeta?.asset_no]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={getRequestTypeBadgeClass(request.request_type)}>
                            {getRequestTypeLabel(request.request_type)}
                          </Badge>
                          <Badge className={getStatusBadgeClass(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        {request.due_date ? <span>Closed cycle due date: {formatDate(request.due_date)}</span> : null}
                        <span>Priority: {normalizePriority(request.priority)}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
