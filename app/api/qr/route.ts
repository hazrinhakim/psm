export const runtime = 'nodejs'

function buildQrUrl(data: string) {
  const encoded = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}`
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const data = searchParams.get('data')

  if (!data) {
    return new Response('Missing data parameter.', { status: 400 })
  }

  const qrResponse = await fetch(buildQrUrl(data))

  if (!qrResponse.ok) {
    return new Response('Failed to generate QR code.', { status: 502 })
  }

  const filename = `qr-${safeFileName(data) || 'code'}.png`

  return new Response(qrResponse.body, {
    status: 200,
    headers: {
      'Content-Type':
        qrResponse.headers.get('content-type') ?? 'image/png',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
