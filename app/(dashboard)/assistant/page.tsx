import { AnimatedCount } from '@/components/dashboard/AnimatedCount'
import { RealtimeFeedbackCount } from '@/components/dashboard/RealtimeFeedbackCount'
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
  MessageSquare,
  Package,
  TrendingUp,
  Wrench,
} from 'lucide-react'

export default async function AssistantDashboard() {
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
      iconStyles: 'bg-blue-50 text-blue-600',
    },
    {
      key: 'active',
      label: 'Active Assets',
      value: activeAssets,
      description: 'Assigned to staff',
      icon: TrendingUp,
      iconStyles: 'bg-emerald-50 text-emerald-600',
    },
    {
      key: 'maintenance',
      label: 'Pending Maintenance',
      value: pendingMaintenance,
      description: 'Awaiting action',
      icon: AlertCircle,
      iconStyles: 'bg-amber-50 text-amber-600',
    },
    {
      key: 'feedback',
      label: 'New Feedback',
      value: feedbackCount,
      description: 'Latest staff input',
      icon: MessageSquare,
      iconStyles: 'bg-sky-50 text-sky-600',
    },
  ]

  const totalStatus = Math.max(totalAssets, 0)
  const statusRows = [
    {
      label: 'Active',
      value: statusOverview.active,
      bar: 'bg-emerald-500',
    },
    {
      label: 'Under Maintenance',
      value: statusOverview.maintenance,
      bar: 'bg-amber-500',
    },
    {
      label: 'Inactive',
      value: statusOverview.inactive,
      bar: 'bg-slate-300',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Here is an overview of your asset management system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconStyles}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {stat.key === 'feedback' ? (
                    <RealtimeFeedbackCount initialCount={stat.value} />
                  ) : (
                    <AnimatedCount value={stat.value} />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">
                Recent Maintenance Requests
              </CardTitle>
              <CardDescription>
                Latest issues reported by staff
              </CardDescription>
            </div>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMaintenance.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No maintenance requests yet.
              </p>
            )}
            {recentMaintenance.map((request: any) => (
              <div
                key={request.id}
                className="flex flex-wrap items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {request.title ?? 'Maintenance request'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requested by{' '}
                    {request.profiles?.full_name ?? 'Staff member'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="capitalize">
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
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Asset Status Overview
            </CardTitle>
            <CardDescription>
              Current asset activity snapshot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusRows.map(row => {
              const percent = totalStatus
                ? Math.round((row.value / totalStatus) * 100)
                : 0
              return (
                <div key={row.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{row.label}</span>
                    <span className="text-muted-foreground">
                      {row.value} assets
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${row.bar}`}
                      style={{ width: `${percent}%` }}
                    />
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
