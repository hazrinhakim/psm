import { getAssets } from '@/lib/assets'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { getDashboardStats } from '@/lib/dashboardStats'

export default async function AdminDashboard() {
  const { totalAssets, categoryMap } = await getDashboardStats()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-slate-500">Total Assets</p>
          <p className="text-3xl font-bold">{totalAssets}</p>
        </div>

        {Object.entries(categoryMap).map(([name, count]) => (
          <div key={name} className="bg-white border rounded-lg p-4">
            <p className="text-sm text-slate-500">{name}</p>
            <p className="text-3xl font-bold">{count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
