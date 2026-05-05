import { AssetScanResult } from '@/components/scan/AssetScanResult'

type AssistantScanResultPageProps = {
  searchParams?: Promise<{
    code?: string
  }>
}

export default async function AssistantScanResultPage({
  searchParams,
}: AssistantScanResultPageProps) {
  const resolvedSearchParams = await searchParams

  return <AssetScanResult code={resolvedSearchParams?.code} />
}
