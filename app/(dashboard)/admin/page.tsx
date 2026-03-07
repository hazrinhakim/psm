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
  Zap,
  Power,
  Sparkles,
} from 'lucide-react'

export default async function AdminDashboard() {
  const {
    userName,
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
      iconStyles: 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 border border-blue-100',
      accentColor: 'from-blue-400 to-blue-300',
    },
    {
      key: 'active',
      label: 'Active Assets',
      value: activeAssets,
      description: 'Assigned to staff',
      icon: Zap,
      iconStyles: 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 border border-emerald-100',
      accentColor: 'from-emerald-400 to-emerald-300',
    },
    {
      key: 'maintenance',
      label: 'Pending Maintenance',
      value: pendingMaintenance,
      description: 'Awaiting action',
      icon: AlertCircle,
      iconStyles: 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 border border-amber-100',
      accentColor: 'from-amber-400 to-amber-300',
    },
    {
      key: 'feedback',
      label: 'New Feedback',
      value: feedbackCount,
      description: 'Latest staff input',
      icon: MessageSquare,
      iconStyles: 'bg-gradient-to-br from-sky-100 to-sky-50 text-sky-600 border border-sky-100',
      accentColor: 'from-sky-400 to-sky-300',
    },
  ]

  const totalStatus = Math.max(totalAssets, 0)
  const statusRows = [
    {
      label: "Active",
      value: statusOverview.active,
      bar: "bg-gradient-to-r from-emerald-400 to-emerald-500",
      dot: "bg-emerald-400 animate-pulse",
      icon: Zap,
      iconClass: "text-emerald-400",
    },
    {
      label: "Under Maintenance",
      value: statusOverview.maintenance,
      bar: "bg-gradient-to-r from-amber-400 to-amber-500",
      dot: "bg-amber-400",
      icon: Wrench,
      iconClass: "text-amber-500",
    },
    {
      label: "Inactive",
      value: statusOverview.inactive,
      bar: "bg-gradient-to-r from-slate-300 to-slate-400",
      dot: "bg-slate-300",
      icon: Power,
      iconClass: "text-slate-500",
    },
  ]

  return (
    <div className="space-y-8 p-1">
      {/* Header dengan sedikit animasi */}
      <div className="space-y-3 animate-in fade-in duration-700">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">
            Dashboard
          </h2>
        </div>
      </div>

      {/* Stats Cards dengan efek hover */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 animate-in slide-in-from-bottom-4 duration-500">
        {statCards.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="group relative overflow-hidden border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              {/* Background gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <CardContent className="pt-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconStyles} shadow-sm group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {/* Corner accent */}
                  <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.accentColor} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                </div>
                <div className="mt-5 text-3xl font-bold tracking-tight">
                  {stat.key === 'feedback' ? (
                    <RealtimeFeedbackCount initialCount={stat.value} />
                  ) : (
                    <AnimatedCount value={stat.value} />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700 mt-2">
                  {stat.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content dengan warna lebih cerah */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] animate-in slide-in-from-bottom-6 duration-700">
        {/* Maintenance Requests Card */}
        <Card className="border-2 border-gray-100 hover:border-gray-200 transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">
                Recent Maintenance Requests
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                Latest issues reported by staff
              </CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-amber-50">
              <Wrench className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            {recentMaintenance.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <Wrench className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="text-base font-medium text-gray-700">
                  All clear! 🎉
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  No maintenance requests at the moment
                </p>
              </div>
            )}
            {recentMaintenance.map((request: any, index: number) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 animate-in fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${request.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'}`} />
                    <p className="text-sm font-semibold text-gray-800">
                      {request.title ?? 'Maintenance request'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    👤 Requested by {request.profiles?.full_name ?? 'Staff member'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    className={`capitalize font-medium
                      ${request.status === 'In Progress' 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' 
                        : request.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        : request.status === 'Pending'
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {String(request.status ?? 'Pending').replace('_', ' ')}
                  </Badge>
                  <p className="mt-2 text-xs text-muted-foreground">
                    📅 {request.created_at
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

        {/* Asset Status Card */}
        <Card className="border-2 border-gray-100 hover:border-gray-200 transition-colors duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">
                Asset Status Overview
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                Current asset activity snapshot
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {statusRows.map((row, index) => {
              const percent = totalStatus
                ? Math.round((row.value / totalStatus) * 100)
                : 0
              return (
                <div key={row.label} className="space-y-3 animate-in fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <row.icon className={`h-4 w-4 ${row.iconClass}`} />
                      <span className="font-medium text-gray-700">{row.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{row.value}</span>
                      <span className="text-muted-foreground">assets</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${row.bar} transition-all duration-1000 ease-out`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground"></span>
                      <span className="font-medium text-gray-700">{percent}%</span>
                    </div>
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