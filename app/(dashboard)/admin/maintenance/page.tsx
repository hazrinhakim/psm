import { MaintenanceList } from '@/components/maintenance/MaintenanceList'

export const dynamic = 'force-dynamic'

type MaintenanceSearchParams = {
  updated?: string
  error?: string
  q?: string
  status?: string
}

export default async function AdminMaintenancePage({
  searchParams,
}: {
  searchParams?: Promise<MaintenanceSearchParams>
}) {
  const resolvedSearchParams = await searchParams

  return (
    <MaintenanceList
      basePath="/admin"
      searchParams={resolvedSearchParams}
    />
  )
}
