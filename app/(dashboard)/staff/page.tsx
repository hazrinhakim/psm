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
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  Package,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

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
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
    },
    {
      label: 'Pending Maintenance',
      value: pendingMaintenance + inProgressMaintenance,
      description: `Requested ${pendingMaintenance} · In Progress ${inProgressMaintenance} · Resolved ${completedMaintenance}`,
      icon: AlertCircle,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      subStats: [
        { label: 'Requested', value: pendingMaintenance, icon: AlertCircle, color: 'text-amber-600' },
        { label: 'In Progress', value: inProgressMaintenance, icon: Clock, color: 'text-blue-600' },
        { label: 'Resolved', value: completedMaintenance, icon: CheckCircle2, color: 'text-emerald-600' },
      ]
    },
  ]

  const totalStatus = Math.max(totalAssets, 0)
  const statusRows = [
    {
      label: 'Active',
      value: statusOverview.active,
      bar: 'bg-emerald-500',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Under Maintenance',
      value: statusOverview.maintenance,
      bar: 'bg-amber-500',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Inactive',
      value: statusOverview.inactive,
      bar: 'bg-slate-300',
      icon: Clock,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
  ]

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Here is an overview of your assigned assets
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className={`border ${stat.borderColor} overflow-hidden`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.iconColor}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <div className="text-3xl font-bold mt-1">
                          <AnimatedCount value={stat.value} />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.description}
                      </p>
                      
                      {/* Sub-stats for maintenance card */}
                      {stat.subStats && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                          {stat.subStats.map((subStat, index) => {
                            const SubIcon = subStat.icon
                            return (
                              <div key={index} className="flex items-center gap-2">
                                <SubIcon className={`h-4 w-4 ${subStat.color}`} />
                                <span className="text-sm font-medium">{subStat.value}</span>
                                <span className="text-xs text-muted-foreground">
                                  {subStat.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Maintenance & Status Overview Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent Maintenance Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">
                Recent Maintenance Requests
              </CardTitle>
              <CardDescription>
                Latest issues you submitted
              </CardDescription>
            </div>
            <Wrench className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMaintenance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Wrench className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No maintenance requests yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submit your first maintenance request to get started
                  </p>
                </div>
              ) : (
                recentMaintenance.map((request: any) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        request.status === 'completed' ? 'bg-emerald-50' :
                        request.status === 'in_progress' ? 'bg-blue-50' :
                        'bg-amber-50'
                      }`}>
                        {request.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : request.status === 'in_progress' ? (
                          <Clock className="h-4 w-4 text-blue-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {request.title || 'Maintenance Request'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.profiles?.full_name || 'Staff member'} • {formatDate(request.created_at)}
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
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Asset Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Asset Status Overview
            </CardTitle>
            <CardDescription>
              Current asset activity snapshot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {statusRows.map((row) => {
              const Icon = row.icon
              const percent = totalStatus
                ? Math.round((row.value / totalStatus) * 100)
                : 0
              
              return (
                <div key={row.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${row.bgColor}`}>
                        <Icon className={`h-4 w-4 ${row.color}`} />
                      </div>
                      <span className="text-sm font-medium">{row.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{row.value}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({percent}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.bar} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
            
            {/* Summary */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Assets</span>
                <span className="text-lg font-bold">{totalStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}