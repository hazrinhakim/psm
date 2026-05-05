import { AssetManagement } from '@/components/assets/AssetManagement'

export default async function AdminAssetsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    saved?: string
    updated?: string
    deleted?: string
    error?: string
    q?: string
  }>
}) {
  const resolvedSearchParams = await searchParams

  return (
    <AssetManagement basePath="/admin" searchParams={resolvedSearchParams} />
  )
}
