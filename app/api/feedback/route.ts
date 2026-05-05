import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await request.json().catch(() => null)
  const ids: unknown[] = Array.isArray(payload?.ids) ? payload.ids : []
  const uniqueIds = Array.from(
    new Set(
      ids
        .filter((id): id is string => typeof id === 'string')
        .map(id => id.trim())
        .filter(Boolean)
    )
  )

  if (!uniqueIds.length) {
    return NextResponse.json({ error: 'No feedback selected' }, { status: 400 })
  }

  const adminClient = createSupabaseAdminClient()
  const client = adminClient ?? supabase
  const { error } = await client.from('feedback').delete().in('id', uniqueIds)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, count: uniqueIds.length })
}
