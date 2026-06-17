import { NextResponse } from 'next/server'
import { ensurePreventiveMaintenanceRequests } from '@/lib/maintenanceActions'
import { normalizeRole } from '@/lib/roles'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function isAuthorized(request: Request) {
  const authHeader = request.headers.get('authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : ''

  const schedulerSecret =
    process.env.MAINTENANCE_SCHEDULER_SECRET ?? process.env.CRON_SECRET ?? ''

  if (!schedulerSecret) {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const role = normalizeRole(profile?.role)
    return role === 'admin' || role === 'admin_assistant'
  }

  if (bearerToken === schedulerSecret) {
    return true
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = normalizeRole(profile?.role)
  return role === 'admin' || role === 'admin_assistant'
}

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
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
