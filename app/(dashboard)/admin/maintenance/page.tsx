import { MaintenanceList } from '@/components/maintenance/MaintenanceList'

export default async function AdminMaintenancePage({
  searchParams,
}: {
  searchParams?: {
    updated?: string
    error?: string
  }
}) {
  return (
    <MaintenanceList basePath="/admin" searchParams={searchParams} />
  )
}
