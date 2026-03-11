import { QrManagement } from '@/components/assets/QrManagement'

export default function AdminQrPage({
  searchParams,
}: {
  searchParams?: {
    qr?: string
    removed?: string
    error?: string
    q?: string
    asset?: string
  }
}) {
  return <QrManagement basePath="/admin" searchParams={searchParams} />
}
