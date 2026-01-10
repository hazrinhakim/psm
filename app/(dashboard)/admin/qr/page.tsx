import { QrManagement } from '@/components/assets/QrManagement'

export default function AdminQrPage({
  searchParams,
}: {
  searchParams?: {
    qr?: string
    error?: string
  }
}) {
  return <QrManagement basePath="/admin" searchParams={searchParams} />
}

