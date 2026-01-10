import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { ReportsDashboard } from '@/components/reports/ReportsDashboard'

function toCountMap<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1
    return acc
  }, {})
}

function buildChartPayload(counts: Record<string, number>) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return {
    labels: entries.map(([label]) => label),
    data: entries.map(([, count]) => count),
  }
}

function buildLastSixMonths() {
  const now = new Date()
  const months: { key: string; label: string }[] = []
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = date.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    })
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    months.push({ key, label })
  }
  return months
}

export async function ReportsOverview() {
  const supabase = createSupabaseServerClient()

  const { data: assets } = await supabase
    .from('assets')
    .select('type, purchase_date, price, asset_categories ( name )')

  const { data: requests } = await supabase
    .from('maintenance_requests')
    .select('status, created_at')

  const categoryCounts = toCountMap(
    (assets ?? []).map(
      (asset: any) => asset.asset_categories?.name ?? 'Uncategorized'
    )
  )

  const typeCounts = toCountMap(
    (assets ?? []).map((asset: any) => asset.type ?? 'Other')
  )

  const statusCounts = toCountMap(
    (requests ?? []).map((request: any) => request.status ?? 'unknown')
  )

  const totalAssets = assets?.length ?? 0
  const totalRequests = requests?.length ?? 0
  const pendingRequests = statusCounts.pending ?? 0
  const inProgressRequests = statusCounts.in_progress ?? 0
  const completedRequests = statusCounts.completed ?? 0

  const months = buildLastSixMonths()
  const monthCounts = months.reduce<Record<string, number>>((acc, month) => {
    acc[month.key] = 0
    return acc
  }, {})

  for (const request of requests ?? []) {
    const createdAt = request?.created_at
    if (!createdAt) {
      continue
    }
    const date = new Date(createdAt)
    if (Number.isNaN(date.getTime())) {
      continue
    }
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    if (Object.prototype.hasOwnProperty.call(monthCounts, key)) {
      monthCounts[key] += 1
    }
  }

  const last30Days = Date.now() - 1000 * 60 * 60 * 24 * 30
  const previous30Days = Date.now() - 1000 * 60 * 60 * 24 * 60
  const recentCount = (requests ?? []).filter((request: any) => {
    const ts = new Date(request?.created_at ?? '').getTime()
    return Number.isFinite(ts) && ts >= last30Days
  }).length
  const previousCount = (requests ?? []).filter((request: any) => {
    const ts = new Date(request?.created_at ?? '').getTime()
    return Number.isFinite(ts) && ts >= previous30Days && ts < last30Days
  }).length

  const insights: string[] = []
  if (pendingRequests > completedRequests) {
    insights.push(
      'Backlog maintenance tinggi berbanding tiket yang selesai. Pertimbangkan tambah slot servis atau penjadualan mingguan.'
    )
  }
  const topCategory = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]
  if (topCategory && totalAssets > 0) {
    const share = (topCategory[1] / totalAssets) * 100
    if (share >= 40) {
      insights.push(
        `Kategori ${topCategory[0]} mendominasi inventori (${share.toFixed(
          0
        )}%). Sesuai untuk polisi servis khusus kategori ini.`
      )
    }
  }
  if (previousCount > 0 && recentCount > previousCount) {
    insights.push(
      'Permintaan maintenance 30 hari terakhir meningkat berbanding 30 hari sebelumnya. Semak punca utama kerosakan.'
    )
  }
  if (insights.length === 0) {
    insights.push(
      'Data masih stabil. Teruskan pemantauan berkala untuk dapatkan corak yang lebih jelas.'
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Quick insights into assets and maintenance activity.
        </p>
      </div>

      <ReportsDashboard
        metrics={{
          totalAssets,
          totalRequests,
          pendingRequests,
          inProgressRequests,
          completedRequests,
        }}
        charts={{
          category: buildChartPayload(categoryCounts),
          type: buildChartPayload(typeCounts),
          status: buildChartPayload(statusCounts),
          maintenanceTrend: {
            labels: months.map(month => month.label),
            data: months.map(month => monthCounts[month.key] ?? 0),
          },
        }}
        insights={insights}
      />
    </div>
  )
}
