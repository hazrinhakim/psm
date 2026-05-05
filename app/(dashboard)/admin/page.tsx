import { AnimatedCount } from '@/components/dashboard/AnimatedCount'
import { RealtimeFeedbackCount } from '@/components/dashboard/RealtimeFeedbackCount'
import { getDashboardStats } from '@/lib/dashboardStats'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  MessageSquare,
  Package,
  Power,
  Wrench,
  Zap,
} from 'lucide-react'

type MaintenanceRequest = {
  id: string
  status?: string | null
  title?: string | null
  created_at?: string | null
  profiles?: {
    full_name?: string | null
  } | null
}

export default async function AdminDashboard() {
  const {
    totalAssets,
    activeAssets,
    pendingMaintenance,
    feedbackCount,
    recentMaintenance,
    statusOverview,
  } = await getDashboardStats()

  const statCards = [
    {
      key: 'total',
      label: 'Total Assets',
      value: totalAssets,
      description: 'All registered items',
      icon: Package,
      iconStyles:
        'border border-blue-200/70 bg-blue-100/55 text-blue-600 dark:border-blue-500/15 dark:bg-blue-500/12 dark:text-blue-300',
    },
    {
      key: 'active',
      label: 'Active Assets',
      value: activeAssets,
      description: 'Assigned to staff',
      icon: Zap,
      iconStyles:
        'border border-emerald-200/70 bg-emerald-100/50 text-emerald-600 dark:border-emerald-500/15 dark:bg-emerald-500/12 dark:text-emerald-300',
    },
    {
      key: 'maintenance',
      label: 'Pending Maintenance',
      value: pendingMaintenance,
      description: 'Awaiting action',
      icon: AlertCircle,
      iconStyles:
        'border border-amber-200/70 bg-amber-100/50 text-amber-600 dark:border-amber-500/15 dark:bg-amber-500/12 dark:text-amber-300',
    },
    {
      key: 'feedback',
      label: 'New Feedback',
      value: feedbackCount,
      description: 'Latest staff input',
      icon: MessageSquare,
      iconStyles:
        'border border-sky-200/70 bg-sky-100/50 text-sky-600 dark:border-sky-500/15 dark:bg-sky-500/12 dark:text-sky-300',
    },
  ]

  const totalStatus = Math.max(totalAssets, 0)

  const statusBadgeClassMap: Record<string, string> = {
    'In Progress':
      'border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-200 dark:hover:bg-orange-500/15',
    Resolved:
      'border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/15',
    Pending:
      'border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/15',
  }

  const statusRows = [
    {
      label: 'Active',
      value: statusOverview.active,
      bar: 'bg-emerald-500',
      icon: Zap,
      iconClass: 'text-emerald-500',
    },
    {
      label: 'Under Maintenance',
      value: statusOverview.maintenance,
      bar: 'bg-amber-500',
      icon: Wrench,
      iconClass: 'text-amber-500',
    },
    {
      label: 'Inactive',
      value: statusOverview.inactive,
      bar: 'bg-slate-400',
      icon: Power,
      iconClass: 'text-slate-500',
    },
  ]

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-border/70 shadow-none">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-3xl font-semibold tracking-tight">
                      {stat.key === 'feedback' ? (
                        <RealtimeFeedbackCount initialCount={stat.value} />
                      ) : (
                        <AnimatedCount value={stat.value} />
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconStyles}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Maintenance Requests
              </CardTitle>
              <CardDescription>Latest issues reported by staff</CardDescription>
            </div>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentMaintenance.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No maintenance requests at the moment.
                </p>
              </div>
            ) : (
              recentMaintenance.map(
                (request: MaintenanceRequest, index: number) => (
                  <div
                    key={request.id}
                    className={`flex items-center justify-between gap-3 py-4 ${
                      index !== recentMaintenance.length - 1
                        ? 'border-b border-border/60'
                        : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            request.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <p className="text-sm font-medium text-foreground">
                          {request.title ?? 'Maintenance request'}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested by {request.profiles?.full_name ?? 'Staff member'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`capitalize border font-medium ${
                          statusBadgeClassMap[request.status ?? ''] ??
                          'border-border bg-muted text-muted-foreground hover:bg-muted dark:hover:bg-muted'
                        }`}
                      >
                        {String(request.status ?? 'Pending').replace('_', ' ')}
                      </Badge>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {request.created_at
                          ? new Date(request.created_at).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                              }
                            )
                          : 'Date unavailable'}
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Asset Status Overview
              </CardTitle>
              <CardDescription>Current asset activity snapshot</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusRows.map(row => {
              const percent = totalStatus
                ? Math.round((row.value / totalStatus) * 100)
                : 0

              return (
                <div key={row.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <row.icon className={`h-4 w-4 ${row.iconClass}`} />
                      <span className="font-medium text-foreground">
                        {row.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {row.value}
                      </span>
                      <span className="text-muted-foreground">assets</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${row.bar}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {percent}%
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
