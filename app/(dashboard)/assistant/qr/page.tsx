import { QrManagement } from '@/components/assets/QrManagement'

type AssistantQrSearchParams = {
  qr?: string
  error?: string
}

export default async function AssistantQrPage({
  searchParams,
}: {
  searchParams?: Promise<AssistantQrSearchParams>
}) {
  const resolvedSearchParams = await searchParams

  return <QrManagement basePath="/assistant" searchParams={resolvedSearchParams} />
}
