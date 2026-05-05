import { AssetScanResult } from '@/components/scan/AssetScanResult'

type StaffScanResultPageProps = {
  searchParams?: Promise<{
    code?: string
  }>
}

export default async function StaffScanResultPage({
  searchParams,
}: StaffScanResultPageProps) {
  const resolvedSearchParams = await searchParams

  return <AssetScanResult code={resolvedSearchParams?.code} />
}
