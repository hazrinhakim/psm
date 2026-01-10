import { AssetScanResult } from '@/components/scan/AssetScanResult'

type StaffScanResultPageProps = {
  searchParams?: {
    code?: string
  }
}

export default function StaffScanResultPage({
  searchParams,
}: StaffScanResultPageProps) {
  return <AssetScanResult code={searchParams?.code} />
}
