import { MaintenanceList } from '@/components/maintenance/MaintenanceList'

export const dynamic = 'force-dynamic'

type MaintenanceSearchParams = {
  updated?: string
  error?: string
  q?: string
  status?: string
}

export default async function AssistantMaintenancePage({
  searchParams,
}: {
  searchParams?: MaintenanceSearchParams | Promise<MaintenanceSearchParams>
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams)

  return (
    <MaintenanceList
      basePath="/assistant"
      searchParams={resolvedSearchParams}
    />
  )
}
