'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from './supabaseAdmin'
import { createSupabaseServerClient } from './supabaseServer'

const allowedStatuses = ['Pending', 'In Progress', 'Resolved'] as const

function getRedirectPath(formData: FormData, fallback: string) {
  const value = String(formData.get('redirectTo') ?? '').trim()
  return value || fallback
}

export async function updateMaintenanceStatus(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/maintenance')
  const id = String(formData.get('id') ?? '').trim()
  const status = String(formData.get('status') ?? '').trim()

  if (!id || !allowedStatuses.includes(status as any)) {
    redirect(`${redirectTo}?error=invalid_request`)
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('maintenance_requests')
    .update({ status })
    .eq('id', id)

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`)
  }

  if (status === 'In Progress' || status === 'Resolved') {
    const adminClient = createSupabaseAdminClient()
    if (adminClient) {
      await adminClient
        .from('notifications')
        .update({ read: true })
        .eq('type', 'maintenance')
        .eq('read', false)
        .ilike('message', `%[maintenance:${id}]%`)
    }
  }

  revalidatePath(redirectTo)
  redirect(`${redirectTo}?updated=1`)
}
