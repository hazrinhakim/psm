import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

type NotificationKind = 'maintenance' | 'feedback'

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const kind = payload?.kind as NotificationKind | undefined

  if (!kind || (kind !== 'maintenance' && kind !== 'feedback')) {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const displayName = profile?.full_name ?? user.email ?? 'Someone'
  const title = typeof payload?.title === 'string' ? payload.title.trim() : ''
  const feedbackId =
    typeof payload?.feedbackId === 'string'
      ? payload.feedbackId.trim()
      : ''
  const maintenanceId =
    typeof payload?.maintenanceId === 'string'
      ? payload.maintenanceId.trim()
      : ''

  const notificationType = kind === 'maintenance' ? 'maintenance' : 'general'
  const maintenancePrefix =
    kind === 'maintenance' && maintenanceId
      ? `[maintenance:${maintenanceId}] `
      : ''
  const feedbackPrefix =
    kind === 'feedback' && feedbackId ? `[feedback:${feedbackId}] ` : ''
  const message =
    kind === 'maintenance'
      ? `${maintenancePrefix}New maintenance request${title ? `: ${title}` : ''} from ${displayName}.`
      : `${feedbackPrefix}New feedback submitted by ${displayName}.`

  const adminClient = createSupabaseAdminClient()
  if (!adminClient) {
    return NextResponse.json(
      { error: 'Service role key missing' },
      { status: 500 }
    )
  }

  const { data: recipients, error: recipientsError } = await adminClient
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'admin_assistant'])

  if (recipientsError) {
    return NextResponse.json(
      { error: recipientsError.message },
      { status: 500 }
    )
  }

  const userIds = (recipients ?? [])
    .map(entry => entry.id)
    .filter(id => id && id !== user.id)

  if (!userIds.length) {
    return NextResponse.json({ ok: true, count: 0 })
  }

  const { error: insertError } = await adminClient
    .from('notifications')
    .insert(
      userIds.map(id => ({
        user_id: id,
        message,
        type: notificationType,
      }))
    )

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, count: userIds.length })
}

export async function PATCH(request: Request) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const kind = payload?.kind as NotificationKind | undefined

  if (!kind || (kind !== 'maintenance' && kind !== 'feedback')) {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
  }

  const notificationType = kind === 'maintenance' ? 'maintenance' : 'general'
  const feedbackId =
    typeof payload?.feedbackId === 'string'
      ? payload.feedbackId.trim()
      : ''
  const maintenanceId =
    typeof payload?.maintenanceId === 'string'
      ? payload.maintenanceId.trim()
      : ''
  const adminClient = createSupabaseAdminClient()
  if (!adminClient) {
    return NextResponse.json(
      { error: 'Service role key missing' },
      { status: 500 }
    )
  }

  let updateQuery = adminClient
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('type', notificationType)
    .eq('read', false)
  if (kind === 'feedback' && feedbackId) {
    updateQuery = updateQuery.ilike('message', `%[feedback:${feedbackId}]%`)
  } else if (kind === 'maintenance' && maintenanceId) {
    updateQuery = updateQuery.ilike('message', `%[maintenance:${maintenanceId}]%`)
  }

  const { error } = await updateQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
