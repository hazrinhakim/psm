import { getAssets } from '@/lib/assets'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function StaffDashboard() {
  const assets = await getAssets()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Asset List
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse and verify the current inventory.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((a: any) => (
          <Card key={a.id}>
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">
                  {a.asset_name}
                </CardTitle>
                {a.asset_categories?.name && (
                  <Badge variant="secondary">
                    {a.asset_categories.name}
                  </Badge>
                )}
              </div>
              <CardDescription>Asset ID: {a.id}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {a.asset_categories?.name
                ? `Category: ${a.asset_categories.name}`
                : 'Category not set'}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
