'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from './supabaseAdmin'
import { createSupabaseServerClient } from './supabaseServer'

const allowedStatuses = ['Pending', 'In Progress', 'Resolved'] as const
type AllowedStatus = (typeof allowedStatuses)[number]

// Progress-to-status mapping for the main maintenance_requests.status field.
const progressToStatusMap = {
  Submitted: 'Pending',
  'Received by Admin': 'Pending',
  'Under Review': 'Pending',
  'In Progress': 'In Progress',
  'Waiting for Parts': 'In Progress',
  Resolved: 'Resolved',
  Completed: 'Resolved',
} as const

type ProgressStep = keyof typeof progressToStatusMap

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

function normalizeProgressStep(value: string): ProgressStep | null {
  const normalized = value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (normalized === 'submitted') return 'Submitted'
  if (normalized === 'received by admin') return 'Received by Admin'
  if (normalized === 'under review') return 'Under Review'
  if (normalized === 'in progress') return 'In Progress'
  if (normalized === 'waiting for parts') return 'Waiting for Parts'
  if (normalized === 'resolved') return 'Resolved'
  if (normalized === 'completed') return 'Completed'
  return null
}

function getProgressStepFromStatus(status: AllowedStatus): ProgressStep {
  if (status === 'In Progress') return 'In Progress'
  if (status === 'Resolved') return 'Resolved'
  return 'Received by Admin'
}

function getRedirectPath(formData: FormData, fallback: string) {
  const value = String(formData.get('redirectTo') ?? '').trim()
  return value || fallback
}

export async function updateMaintenanceStatus(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/maintenance')
  const id = String(formData.get('id') ?? '').trim()
  const statusInput = String(formData.get('status') ?? '').trim()
  const progressInput = String(formData.get('progress_step') ?? '').trim()
  const noteInput = String(formData.get('note') ?? '').trim()

  const normalizedProgress = normalizeProgressStep(progressInput)
  const normalizedStatus = normalizeStatus(statusInput)
  const status =
    normalizedProgress ? progressToStatusMap[normalizedProgress] : normalizedStatus

  if (!id || !status || !allowedStatuses.includes(status)) {
    redirect(`${redirectTo}?error=invalid_request`)
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const progressStep =
    normalizedProgress ?? (status ? getProgressStepFromStatus(status) : null)

  if (!progressStep) {
    redirect(`${redirectTo}?error=invalid_request`)
  }

  const updates: {
    status: AllowedStatus
    updated_at: string
    admin_remark?: string | null
  } = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (noteInput) {
    updates.admin_remark = noteInput
  }

  const { error } = await supabase
    .from('maintenance_requests')
    .update(updates)
    .eq('id', id)

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`)
  }

  const { error: updateInsertError } = await supabase
    .from('maintenance_request_updates')
    .insert({
      maintenance_request_id: id,
      progress_step: progressStep,
      note: noteInput || null,
      updated_by: user?.id ?? null,
    })

  if (updateInsertError) {
    redirect(
      `${redirectTo}?error=${encodeURIComponent(updateInsertError.message)}`
    )
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
