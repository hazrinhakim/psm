import { AnimatedCount } from '@/components/dashboard/AnimatedCount'
import { getDashboardStats } from '@/lib/dashboardStats'
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Wrench,
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

  const totalStatus = Math.max(totalAssets, 0)
  const statusRows = [
    {
      label: 'Active',
      value: statusOverview.active,
      bar: 'bg-emerald-500',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-300',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: 'Under Maintenance',
      value: statusOverview.maintenance,
      bar: 'bg-amber-500',
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-300',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      label: 'Inactive',
      value: statusOverview.inactive,
      bar: 'bg-slate-400',
      icon: Clock,
      color: 'text-slate-600 dark:text-slate-300',
      bgColor: 'bg-slate-50 dark:bg-slate-500/10',
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

  const getStatusBadgeVariant = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default'
      case 'in_progress':
        return 'secondary'
      case 'pending':
        return 'outline'
      default:
        return 'secondary'
    }
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

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Maintenance Requests
              </CardTitle>
              <CardDescription>Latest issues you submitted</CardDescription>
            </div>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMaintenance.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No maintenance requests yet.
                  </p>
                </div>
              ) : (
                recentMaintenance.map(
                  (request: MaintenanceRequest, index: number) => (
                    <div
                      key={request.id}
                      className={`flex items-center justify-between gap-3 ${
                        index !== recentMaintenance.length - 1
                          ? 'border-b border-border/60 pb-4'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-lg p-2 ${
                            request.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-500/15'
                              : request.status === 'in_progress'
                                ? 'bg-blue-100 dark:bg-blue-500/15'
                                : 'bg-amber-100 dark:bg-amber-500/15'
                          }`}
                        >
                          {request.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                          ) : request.status === 'in_progress' ? (
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {request.title || 'Maintenance Request'}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {request.profiles?.full_name || 'Staff member'} ·{' '}
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(request.status)}
                        className="capitalize"
                      >
                        {String(request.status || 'pending').replace('_', ' ')}
                      </Badge>
                    </div>
                  )
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Asset Status Overview
            </CardTitle>
            <CardDescription>Current asset activity snapshot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {statusRows.map(row => {
              const Icon = row.icon
              const percent = totalStatus
                ? Math.round((row.value / totalStatus) * 100)
                : 0

              return (
                <div key={row.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${row.bgColor}`}>
                        <Icon className={`h-4 w-4 ${row.color}`} />
                      </div>
                      <span className="text-sm font-medium">{row.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{row.value}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({percent}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${row.bar}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}

            <div className="border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Assets</span>
                <span className="text-lg font-semibold">{totalStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
