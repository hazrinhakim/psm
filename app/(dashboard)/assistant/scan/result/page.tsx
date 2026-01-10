import { AssetScanResult } from '@/components/scan/AssetScanResult'

type AssistantScanResultPageProps = {
  searchParams?: {
    code?: string
  }
}

export default function AssistantScanResultPage({
  searchParams,
}: AssistantScanResultPageProps) {
  return <AssetScanResult code={searchParams?.code} />
}
