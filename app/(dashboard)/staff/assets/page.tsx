import { AssetManagement } from '@/components/assets/AssetManagement'

export default function StaffAssetsPage({
  searchParams,
}: {
  searchParams?: {
    saved?: string
    updated?: string
    deleted?: string
    error?: string
    q?: string
  }
}) {
  return (
    <AssetManagement basePath="/staff" searchParams={searchParams} />
  )
}
