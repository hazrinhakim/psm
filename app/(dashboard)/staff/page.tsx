import { AnimatedCount } from '@/components/dashboard/AnimatedCount'
import { AssetStatusOverview } from '@/components/dashboard/AssetStatusOverview'
import { getDashboardStats } from '@/lib/dashboardStats'
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Clock, Package, Wrench } from 'lucide-react'

type MaintenanceRequest = {
  id: string
  status?: string | null
  title?: string | null
  created_at?: string | null
  profiles?: {
    full_name?: string | null
  } | null
}

export default async function StaffDashboard() {
  const {
    totalAssets,
    pendingMaintenance,
    inProgressMaintenance,
    completedMaintenance,
    recentMaintenance,
    statusOverview,
  } = await getDashboardStats('assigned')

  const statCards = [
    {
      label: 'Total Assets',
      value: totalAssets,
      description: 'Assets assigned to you',
      icon: Package,
      iconBg:
        'border border-blue-200/70 bg-blue-100/55 dark:border-blue-500/15 dark:bg-blue-500/12',
      iconColor: 'text-blue-600 dark:text-blue-300',
    },
    {
      label: 'Pending Maintenance',
      value: pendingMaintenance + inProgressMaintenance,
      description: `Requested ${pendingMaintenance} · In Progress ${inProgressMaintenance} · Resolved ${completedMaintenance}`,
      icon: AlertCircle,
      iconBg:
        'border border-amber-200/70 bg-amber-100/50 dark:border-amber-500/15 dark:bg-amber-500/12',
      iconColor: 'text-amber-600 dark:text-amber-300',
      subStats: [
        {
          label: 'Requested',
          value: pendingMaintenance,
          icon: AlertCircle,
          color: 'text-amber-600 dark:text-amber-300',
        },
        {
          label: 'In Progress',
          value: inProgressMaintenance,
          icon: Clock,
          color: 'text-blue-600 dark:text-blue-300',
        },
        {
          label: 'Resolved',
          value: completedMaintenance,
          icon: CheckCircle2,
          color: 'text-emerald-600 dark:text-emerald-300',
        },
      ],
    },
  ]

  const formatDate = (dateString?: string | null) => {
    if (!dateString) {
      return 'Date unavailable'
    }

    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        {statCards.map(stat => {
          const Icon = stat.icon

          return (
            <Card key={stat.label} className="border-border/70 shadow-none">
              <CardContent className="px-6 pb-6 pt-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-3xl font-semibold">
                        <AnimatedCount value={stat.value} />
                      </div>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {stat.label}
                      </p>
                    </div>
                    <div
                      className={`shrink-0 rounded-xl p-2.5 ${stat.iconBg} ${stat.iconColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.description}
                    </p>

                    {stat.subStats ? (
                      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-border/60 pt-3">
                        {stat.subStats.map((subStat, index) => {
                          const SubIcon = subStat.icon
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <SubIcon className={`h-4 w-4 ${subStat.color}`} />
                              <span className="text-sm font-medium">
                                {subStat.value}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {subStat.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Maintenance Requests
              </CardTitle>
              <CardDescription>
                Your latest requests that are still pending review
              </CardDescription>
            </div>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMaintenance.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No new pending maintenance requests yet.
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
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.14)]" />
                            <p className="truncate text-sm font-medium sm:text-[15px]">
                              {request.title || 'Maintenance Request'}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full bg-background px-2.5 py-1 ring-1 ring-border/60">
                              {request.profiles?.full_name || 'Staff member'}
                            </span>
                            <span className="rounded-full bg-background px-2.5 py-1 ring-1 ring-border/60">
                              {formatDate(request.created_at)}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className="shrink-0 border-amber-200 bg-amber-100 text-amber-700 capitalize hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/15"
                        >
                          {String(request.status || 'pending').replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
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
