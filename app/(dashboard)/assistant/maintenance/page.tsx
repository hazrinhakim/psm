import { MaintenanceList } from '@/components/maintenance/MaintenanceList'

export default function AssistantMaintenancePage({
  searchParams,
}: {
  searchParams?: {
    updated?: string
    error?: string
  }
}) {
  return (
    <MaintenanceList basePath="/assistant" searchParams={searchParams} />
  )
}
