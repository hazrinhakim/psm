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

type AllowedScheduleType = 'preventive' | 'inspection' | 'calibration'

type AllowedPriority = 'low' | 'medium' | 'high' | 'critical'
type ServiceOutcome = 'completed' | 'partially_completed' | 'monitoring_required'

const completionChecklistFields = [
  { field: 'checklist_inspection', label: 'Initial inspection completed' },
  { field: 'checklist_hardware', label: 'Hardware components checked' },
  { field: 'checklist_cleaning', label: 'Device cleaned and serviced' },
  { field: 'checklist_software', label: 'Software or configuration verified' },
  { field: 'checklist_testing', label: 'Final testing completed' },
] as const

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

function normalizeScheduleType(value: string): AllowedScheduleType {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'inspection') return 'inspection'
  if (normalized === 'calibration') return 'calibration'
  return 'preventive'
}

function normalizePriority(value: string): AllowedPriority {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'low') return 'low'
  if (normalized === 'high') return 'high'
  if (normalized === 'critical') return 'critical'
  return 'medium'
}

function parsePositiveInteger(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return null

  const parsed = Number.parseInt(normalized, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

function parseNonNegativeInteger(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return null

  const parsed = Number.parseInt(normalized, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

function parseDateOnly(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return null
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null
}

function parseDateTime(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return null
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function addDays(dateString: string, days: number) {
  const baseDate = new Date(`${dateString}T00:00:00Z`)
  if (Number.isNaN(baseDate.getTime())) return null
  baseDate.setUTCDate(baseDate.getUTCDate() + days)
  return baseDate.toISOString().slice(0, 10)
}

function getTodayDateOnly() {
  return new Date().toISOString().slice(0, 10)
}

function getAutomationClient() {
  return createSupabaseAdminClient()
}

function normalizeServiceOutcome(value: string): ServiceOutcome | null {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'completed') return 'completed'
  if (normalized === 'partially_completed') return 'partially_completed'
  if (normalized === 'monitoring_required') return 'monitoring_required'
  return null
}

function extractCompletionChecklist(formData: FormData) {
  return completionChecklistFields.map(item => ({
    id: item.field,
    label: item.label,
    checked: formData.get(item.field) === 'on',
  }))
}

async function createPreventiveNotifications(
  maintenanceId: string,
  title: string
) {
  const adminClient = createSupabaseAdminClient()
  if (!adminClient) return

  const { data: recipients } = await adminClient
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'admin_assistant'])

  const userIds = (recipients ?? []).map(entry => entry.id).filter(Boolean)
  if (!userIds.length) return

  await adminClient.from('notifications').insert(
    userIds.map(id => ({
      user_id: id,
      type: 'maintenance',
      message: `[maintenance:${maintenanceId}] Preventive maintenance due: ${title}.`,
      related_entity_type: 'maintenance_request',
      related_entity_id: maintenanceId,
      sent_at: new Date().toISOString(),
    }))
  )
}

async function createScheduleAlertNotifications(
  scheduleId: string,
  title: string,
  nextDueDate: string,
  alertType: 'due_soon' | 'overdue'
) {
  const adminClient = createSupabaseAdminClient()
  if (!adminClient) return

  const prefix = `[schedule:${scheduleId}][alert:${alertType}]`
  const { data: recipients } = await adminClient
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'admin_assistant'])

  const userIds = (recipients ?? []).map(entry => entry.id).filter(Boolean)
  if (!userIds.length) return

  const { data: existingNotes } = await adminClient
    .from('notifications')
    .select('id, user_id')
    .in('user_id', userIds)
    .eq('type', 'maintenance')
    .eq('related_entity_type', 'maintenance_schedule')
    .eq('related_entity_id', scheduleId)
    .eq('scheduled_for', `${nextDueDate}T00:00:00+00:00`)
    .ilike('message', `%${prefix}%`)

  const existingUserIds = new Set((existingNotes ?? []).map(note => note.user_id))
  const targetUserIds = userIds.filter(id => !existingUserIds.has(id))
  if (!targetUserIds.length) return

  const detail =
    alertType === 'overdue'
      ? `Asset service is overdue since ${nextDueDate}.`
      : `Asset service is due soon on ${nextDueDate}.`

  await adminClient.from('notifications').insert(
    targetUserIds.map(id => ({
      user_id: id,
      type: 'maintenance',
      message: `${prefix} ${title}. ${detail}`,
      related_entity_type: 'maintenance_schedule',
      related_entity_id: scheduleId,
      scheduled_for: `${nextDueDate}T00:00:00+00:00`,
      sent_at: new Date().toISOString(),
    }))
  )
}

async function syncResolvedPreventiveMaintenance(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  maintenanceRequest: {
    id: string
    asset_id?: string | null
    request_type?: string | null
    schedule_id?: string | null
    due_date?: string | null
  },
  noteInput: string
) {
  if (maintenanceRequest.request_type !== 'preventive') {
    return
  }

  const resolvedDate = getTodayDateOnly()

  const { data: asset } = maintenanceRequest.asset_id
    ? await supabase
        .from('assets')
        .select(
          'id, service_interval_days, maintenance_notes, next_service_date'
        )
        .eq('id', maintenanceRequest.asset_id)
        .maybeSingle()
    : { data: null }

  const { data: schedule } = maintenanceRequest.schedule_id
    ? await supabase
        .from('maintenance_schedules')
        .select('id, interval_days, notes')
        .eq('id', maintenanceRequest.schedule_id)
        .maybeSingle()
    : { data: null }

  const intervalDays =
    schedule?.interval_days ?? asset?.service_interval_days ?? null
  const nextServiceDate = intervalDays ? addDays(resolvedDate, intervalDays) : null

  if (maintenanceRequest.asset_id) {
    await supabase
      .from('assets')
      .update({
        last_service_date: resolvedDate,
        next_service_date: nextServiceDate,
        maintenance_notes: noteInput || asset?.maintenance_notes || null,
      })
      .eq('id', maintenanceRequest.asset_id)
  }

  if (schedule?.id) {
    await supabase
      .from('maintenance_schedules')
      .update({
        last_service_date: resolvedDate,
        next_due_date: nextServiceDate,
        notes: noteInput || schedule.notes || null,
      })
      .eq('id', schedule.id)

    await supabase.from('maintenance_schedule_logs').insert({
      schedule_id: schedule.id,
      asset_id: maintenanceRequest.asset_id,
      maintenance_request_id: maintenanceRequest.id,
      action_type: 'service_completed',
      action_date: resolvedDate,
      message: noteInput || 'Preventive maintenance completed.',
    })
  }

  await supabase
    .from('maintenance_requests')
    .update({
      resolved_at: new Date().toISOString(),
      resolution_summary: noteInput || 'Preventive maintenance completed.',
    })
    .eq('id', maintenanceRequest.id)
}

export async function ensurePreventiveMaintenanceRequests() {
  const supabase = getAutomationClient()
  if (!supabase) {
    return {
      ok: false,
      createdRequests: 0,
      dueSoonAlerts: 0,
      overdueAlerts: 0,
      reason: 'missing_service_role_key',
    }
  }

  const today = getTodayDateOnly()
  let createdRequests = 0
  let dueSoonAlerts = 0
  let overdueAlerts = 0

  const { data: dueSchedules, error } = await supabase
    .from('maintenance_schedules')
    .select(
      `
      id,
      asset_id,
      title,
      description,
      priority,
      next_due_date,
      assigned_to,
      auto_create_request,
      assets ( asset_no, asset_name )
    `
    )
    .eq('is_active', true)
    .lte('next_due_date', today)

  if (error || !dueSchedules?.length) {
    return {
      ok: !error,
      createdRequests,
      dueSoonAlerts,
      overdueAlerts,
      reason: error?.message,
    }
  }

  for (const schedule of dueSchedules) {
    const { count } = await supabase
      .from('maintenance_requests')
      .select('id', { count: 'exact', head: true })
      .eq('schedule_id', schedule.id)
      .neq('status', 'Resolved')

    if ((count ?? 0) > 0) {
      continue
    }

    const assetMeta = Array.isArray(schedule.assets)
      ? schedule.assets[0]
      : schedule.assets
    const title =
      schedule.title ||
      `Preventive maintenance for ${assetMeta?.asset_name ?? assetMeta?.asset_no ?? 'asset'}`

    const { data: createdRequest, error: requestError } = await supabase
      .from('maintenance_requests')
      .insert({
        title,
        description: schedule.description || 'Automatically generated preventive maintenance task.',
        asset_id: schedule.asset_id,
        status: 'Pending',
        request_type: 'preventive',
        priority: schedule.priority ?? 'medium',
        source: 'system',
        scheduled_date: today,
        due_date: schedule.next_due_date,
        assigned_to: schedule.assigned_to ?? null,
        schedule_id: schedule.id,
      })
      .select('id')
      .single()

    if (requestError || !createdRequest?.id) {
      continue
    }
    createdRequests += 1

    await supabase.from('maintenance_request_updates').insert({
      maintenance_request_id: createdRequest.id,
      progress_step: 'Submitted',
      note: 'Automatically generated from preventive maintenance schedule.',
      updated_by: null,
    })

    await supabase.from('maintenance_schedule_logs').insert([
      {
        schedule_id: schedule.id,
        asset_id: schedule.asset_id,
        maintenance_request_id: createdRequest.id,
        action_type: 'request_created',
        action_date: today,
        message: 'Preventive maintenance request auto-created by the system.',
      },
    ])

    await createPreventiveNotifications(createdRequest.id, title)
  }

  const { data: activeSchedules } = await supabase
    .from('v_maintenance_schedule_dashboard')
    .select('id, title, next_due_date, schedule_state')
    .in('schedule_state', ['due_soon', 'overdue'])

  for (const schedule of activeSchedules ?? []) {
    if (!schedule.next_due_date || !schedule.schedule_state) continue
    await createScheduleAlertNotifications(
      schedule.id,
      schedule.title,
      schedule.next_due_date,
      schedule.schedule_state as 'due_soon' | 'overdue'
    )
    if (schedule.schedule_state === 'due_soon') {
      dueSoonAlerts += 1
    } else if (schedule.schedule_state === 'overdue') {
      overdueAlerts += 1
    }
  }

  return {
    ok: true,
    createdRequests,
    dueSoonAlerts,
    overdueAlerts,
  }
}

export async function updateMaintenanceStatus(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/maintenance')
  const id = String(formData.get('id') ?? '').trim()
  const statusInput = String(formData.get('status') ?? '').trim()
  const progressInput = String(formData.get('progress_step') ?? '').trim()
  const noteInput = String(formData.get('note') ?? '').trim()
  const workSummaryInput = String(formData.get('work_summary') ?? '').trim()
  const serviceOutcomeInput = String(formData.get('service_outcome') ?? '').trim()
  const performedAtInput = parseDateTime(formData.get('performed_at'))
  const downtimeHoursInput = String(formData.get('estimated_downtime_hours') ?? '').trim()

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
  const { data: maintenanceRequest } = await supabase
    .from('maintenance_requests')
    .select('id, asset_id, request_type, schedule_id, due_date')
    .eq('id', id)
    .maybeSingle()

  const progressStep =
    normalizedProgress ?? (status ? getProgressStepFromStatus(status) : null)
  const checklistItems = extractCompletionChecklist(formData)
  const checkedChecklistCount = checklistItems.filter(item => item.checked).length
  const shouldStoreCompletionDetails =
    progressStep === 'Resolved' || progressStep === 'Completed'
  const normalizedServiceOutcome = normalizeServiceOutcome(serviceOutcomeInput)
  const downtimeHoursValue =
    downtimeHoursInput && !Number.isNaN(Number(downtimeHoursInput))
      ? Number(downtimeHoursInput)
      : null

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
      checklist_items: shouldStoreCompletionDetails ? checklistItems : null,
      work_summary: shouldStoreCompletionDetails ? workSummaryInput || null : null,
      service_outcome:
        shouldStoreCompletionDetails && normalizedServiceOutcome
          ? normalizedServiceOutcome
          : null,
      performed_at:
        shouldStoreCompletionDetails
          ? performedAtInput ?? new Date().toISOString()
          : null,
      estimated_downtime_hours:
        shouldStoreCompletionDetails && downtimeHoursValue !== null
          ? downtimeHoursValue
          : null,
    })

  if (updateInsertError) {
    redirect(
      `${redirectTo}?error=${encodeURIComponent(updateInsertError.message)}`
    )
  }

  if (status === 'Resolved' && maintenanceRequest) {
    const completionSummary =
      workSummaryInput ||
      noteInput ||
      (checkedChecklistCount > 0
        ? `${checkedChecklistCount} checklist item(s) completed.`
        : '')

    await syncResolvedPreventiveMaintenance(
      supabase,
      maintenanceRequest,
      completionSummary
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

export async function savePreventiveMaintenanceSchedule(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/maintenance')
  const assetId = String(formData.get('asset_id') ?? '').trim()
  const titleInput = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()
  const scheduleType = normalizeScheduleType(
    String(formData.get('maintenance_type') ?? '')
  )
  const priority = normalizePriority(String(formData.get('priority') ?? ''))
  const intervalDays = parsePositiveInteger(formData.get('interval_days'))
  const reminderDaysBefore =
    parseNonNegativeInteger(formData.get('reminder_days_before')) ?? 7
  const lastServiceDate = parseDateOnly(formData.get('last_service_date'))
  const providedNextDueDate = parseDateOnly(formData.get('next_due_date'))
  const autoCreateRequest = formData.get('auto_create_request') === 'on'

  const nextDueDate =
    providedNextDueDate ??
    (lastServiceDate && intervalDays ? addDays(lastServiceDate, intervalDays) : null)

  if (!assetId || !intervalDays || !nextDueDate) {
    redirect(`${redirectTo}?error=invalid_schedule_input`)
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .select('id, asset_no, asset_name')
    .eq('id', assetId)
    .maybeSingle()

  if (assetError || !asset) {
    redirect(
      `${redirectTo}?error=${encodeURIComponent(assetError?.message ?? 'Asset not found')}`
    )
  }

  const generatedTitle =
    titleInput ||
    `Scheduled ${scheduleType} for ${asset.asset_name ?? asset.asset_no ?? 'asset'}`

  const { data: existingSchedule } = await supabase
    .from('maintenance_schedules')
    .select('id')
    .eq('asset_id', assetId)
    .eq('title', generatedTitle)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  const baseSchedulePayload = {
    asset_id: assetId,
    title: generatedTitle,
    description: description || null,
    maintenance_type: scheduleType,
    priority,
    interval_days: intervalDays,
    reminder_days_before: reminderDaysBefore,
    last_service_date: lastServiceDate,
    next_due_date: nextDueDate,
    auto_create_request: autoCreateRequest,
    is_active: true,
    notes: notes || null,
  }

  const scheduleMutation = existingSchedule?.id
    ? await supabase
        .from('maintenance_schedules')
        .update(baseSchedulePayload)
        .eq('id', existingSchedule.id)
    : await supabase.from('maintenance_schedules').insert({
        ...baseSchedulePayload,
        created_by: user?.id ?? null,
      })

  if (scheduleMutation.error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(scheduleMutation.error.message)}`)
  }

  const { error: assetUpdateError } = await supabase
    .from('assets')
    .update({
      maintenance_enabled: true,
      maintenance_strategy: scheduleType === 'preventive' ? 'preventive' : 'hybrid',
      maintenance_priority: priority,
      service_interval_days: intervalDays,
      last_service_date: lastServiceDate,
      next_service_date: nextDueDate,
      maintenance_notes: notes || description || null,
    })
    .eq('id', assetId)

  if (assetUpdateError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(assetUpdateError.message)}`)
  }

  revalidatePath(redirectTo)
  redirect(`${redirectTo}?saved=schedule`)
}
