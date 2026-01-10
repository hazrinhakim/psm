import { AssetManagement } from '@/components/assets/AssetManagement'

export default function AdminAssetsPage({
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
  return <AssetManagement basePath="/admin" searchParams={searchParams} />
}
