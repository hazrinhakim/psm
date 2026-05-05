import { QrManagement } from '@/components/assets/QrManagement'

type AdminQrSearchParams = {
  qr?: string
  removed?: string
  error?: string
  q?: string
  asset?: string
}

export default async function AdminQrPage({
  searchParams,
}: {
  searchParams?: Promise<AdminQrSearchParams>
}) {
  const resolvedSearchParams = await searchParams

  return <QrManagement basePath="/admin" searchParams={resolvedSearchParams} />
}
