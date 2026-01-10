import { AssetManagement } from '@/components/assets/AssetManagement'

export default function AssistantAssetsPage({
  searchParams,
}: {
  searchParams?: {
    saved?: string
    updated?: string
    deleted?: string
    error?: string
  }
}) {
  return <AssetManagement basePath="/assistant" searchParams={searchParams} />
}

