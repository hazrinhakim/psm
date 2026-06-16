import { AnimatedCount } from '@/components/dashboard/AnimatedCount'
import { AssetStatusOverview } from '@/components/dashboard/AssetStatusOverview'
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
import { AlertCircle, MessageSquare, Package, Wrench, Zap } from 'lucide-react'

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

  const statusBadgeClassMap: Record<string, string> = {
    Pending:
      'border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/15',
    'In Progress':
      'border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-200 dark:hover:bg-orange-500/15',
    Resolved:
      'border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/15',
  }

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

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader className="flex flex-col gap-3 space-y-0 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Maintenance Requests
              </CardTitle>
              <CardDescription>
                New requests that are still pending review
              </CardDescription>
            </div>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentMaintenance.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No new pending maintenance requests at the moment.
                </p>
              </div>
            ) : (
              recentMaintenance.map(
                (request: MaintenanceRequest, index: number) => (
                  <div
                    key={request.id}
                    className={`rounded-2xl border border-border/70 bg-muted/[0.14] px-4 py-4 ${
                      index !== recentMaintenance.length - 1
                        ? 'mb-3'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.14)]" />
                          <p className="truncate text-sm font-medium text-foreground sm:text-[15px]">
                            {request.title ?? 'Maintenance request'}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full bg-background px-2.5 py-1 ring-1 ring-border/60">
                            Requested by{' '}
                            {request.profiles?.full_name ?? 'Staff member'}
                          </span>
                          <span className="rounded-full bg-background px-2.5 py-1 ring-1 ring-border/60">
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
                          </span>
                        </div>
                      </div>

                      <Badge
                        className={`shrink-0 capitalize border font-medium ${
                          statusBadgeClassMap[request.status ?? 'Pending'] ??
                          'border-border bg-muted text-muted-foreground hover:bg-muted dark:hover:bg-muted'
                        }`}
                      >
                        {String(request.status ?? 'Pending').replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                )
              )
            )}
          </CardContent>
        </Card>

        <AssetStatusOverview
          active={statusOverview.active}
          maintenance={statusOverview.maintenance}
          inactive={statusOverview.inactive}
        />
      </div>
    </div>
  )
}
