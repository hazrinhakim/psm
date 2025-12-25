import { getAssets } from '@/lib/assets'

export default async function StaffDashboard() {
  const assets = await getAssets()

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Asset List</h1>

      <ul className="space-y-2">
        {assets.map((a: any) => (
          <li key={a.id} className="p-3 bg-white border rounded">
            {a.asset_name} — {a.asset_categories?.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
