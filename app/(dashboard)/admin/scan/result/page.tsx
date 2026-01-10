import { AssetScanResult } from '@/components/scan/AssetScanResult'

type AdminScanResultPageProps = {
  searchParams?: {
    code?: string
  }
}

export default function AdminScanResultPage({
  searchParams,
}: AdminScanResultPageProps) {
  return <AssetScanResult code={searchParams?.code} />
}
