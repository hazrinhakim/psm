import { AnimatedCount } from '@/components/dashboard/AnimatedCount'
import { getDashboardStats } from '@/lib/dashboardStats'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function AdminDashboard() {
  const { totalAssets, categoryMap } = await getDashboardStats()
  const categoryEntries = Object.entries(categoryMap)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Snapshot of asset volume across categories.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">
              <AnimatedCount value={totalAssets} />
            </div>
          </CardContent>
        </Card>

        {categoryEntries.map(([name, count]) => (
          <Card key={name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">
                <AnimatedCount value={count} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
