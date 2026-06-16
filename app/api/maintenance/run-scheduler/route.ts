import { NextResponse } from 'next/server'
import { ensurePreventiveMaintenanceRequests } from '@/lib/maintenanceActions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isAuthorized(request: Request) {
  const authHeader = request.headers.get('authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : ''

  const schedulerSecret =
    process.env.MAINTENANCE_SCHEDULER_SECRET ?? process.env.CRON_SECRET ?? ''

  if (!schedulerSecret) {
    return false
  }

  return bearerToken === schedulerSecret
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await ensurePreventiveMaintenanceRequests()
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  })
}

export async function POST(request: Request) {
  return GET(request)
}
