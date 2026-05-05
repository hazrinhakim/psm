import { AssetScanResult } from '@/components/scan/AssetScanResult'

type AdminScanResultPageProps = {
  searchParams?: Promise<{
    code?: string
  }>
}

export default async function AdminScanResultPage({
  searchParams,
}: AdminScanResultPageProps) {
  const resolvedSearchParams = await searchParams

  return <AssetScanResult code={resolvedSearchParams?.code} />
}
