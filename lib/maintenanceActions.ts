'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from './supabaseAdmin'
import { createSupabaseServerClient } from './supabaseServer'

const allowedStatuses = ['Pending', 'In Progress', 'Resolved'] as const
type AllowedStatus = (typeof allowedStatuses)[number]

function normalizeStatus(value: string): AllowedStatus | null {
  const normalized = value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (normalized === 'pending') return 'Pending'
  if (normalized === 'in progress') return 'In Progress'
  if (normalized === 'resolved' || normalized === 'completed') return 'Resolved'
  return null
}

function getRedirectPath(formData: FormData, fallback: string) {
  const value = String(formData.get('redirectTo') ?? '').trim()
  return value || fallback
}

export async function updateMaintenanceStatus(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/maintenance')
  const id = String(formData.get('id') ?? '').trim()
  const statusInput = String(formData.get('status') ?? '').trim()
  const status = normalizeStatus(statusInput)

  if (!id || !status || !allowedStatuses.includes(status)) {
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
