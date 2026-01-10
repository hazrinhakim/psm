import { QrManagement } from '@/components/assets/QrManagement'

export default function AssistantQrPage({
  searchParams,
}: {
  searchParams?: {
    qr?: string
    error?: string
  }
}) {
  return <QrManagement basePath="/assistant" searchParams={searchParams} />
}

