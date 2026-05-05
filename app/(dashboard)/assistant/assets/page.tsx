import { AssetManagement } from '@/components/assets/AssetManagement'

export default async function AssistantAssetsPage({
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
    <AssetManagement
      basePath="/assistant"
      searchParams={resolvedSearchParams}
    />
  )
}
