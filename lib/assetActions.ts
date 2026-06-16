'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from './supabaseServer'

function getRedirectPath(formData: FormData, fallback: string) {
  const value = String(formData.get('redirectTo') ?? '').trim()
  return value || fallback
}

function sanitizeValue(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function parsePositiveInteger(value: FormDataEntryValue | null) {
  const normalized = sanitizeValue(value)
  if (!normalized) return null
  const parsed = Number.parseInt(normalized, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function sanitizeMaintenanceEnabled(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized !== 'disabled'
}

function sanitizeMaintenanceStrategy(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'preventive') return 'preventive'
  if (normalized === 'hybrid') return 'hybrid'
  return 'corrective'
}

function sanitizeMaintenancePriority(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'low') return 'low'
  if (normalized === 'high') return 'high'
  if (normalized === 'critical') return 'critical'
  return 'medium'
}

function addDays(dateString: string, days: number) {
  const baseDate = new Date(`${dateString}T00:00:00Z`)
  if (Number.isNaN(baseDate.getTime())) return null
  baseDate.setUTCDate(baseDate.getUTCDate() + days)
  return baseDate.toISOString().slice(0, 10)
}

async function findProfileByFullName(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  fullName: string
) {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('full_name', fullName)
    .limit(1)
    .maybeSingle()

  return data ?? null
}

async function openAssetAssignmentHistory(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  {
    assetId,
    userName,
    startedBy,
  }: {
    assetId: string
    userName: string | null
    startedBy: string | null
  }
) {
  if (!userName) {
    return
  }

  const matchedProfile = await findProfileByFullName(supabase, userName)

  await supabase.from('asset_assignment_history').insert({
    asset_id: assetId,
    assigned_user_id: matchedProfile?.id ?? null,
    assigned_user_name: userName,
    started_by: startedBy,
  })
}

async function closeActiveAssetAssignmentHistory(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  {
    assetId,
    endedBy,
    endedReason,
  }: {
    assetId: string
    endedBy: string | null
    endedReason: 'reassigned' | 'manual_unassign' | 'asset_deleted'
  }
) {
  await supabase
    .from('asset_assignment_history')
    .update({
      unassigned_at: new Date().toISOString(),
      ended_by: endedBy,
      ended_reason: endedReason,
    })
    .eq('asset_id', assetId)
    .is('unassigned_at', null)
}

function buildAssetPayload(formData: FormData, userName: string | null) {
  const maintenanceEnabled = sanitizeMaintenanceEnabled(
    formData.get('maintenance_enabled')
  )
  const maintenanceStrategy = sanitizeMaintenanceStrategy(
    formData.get('maintenance_strategy')
  )
  const maintenancePriority = sanitizeMaintenancePriority(
    formData.get('maintenance_priority')
  )
  const serviceIntervalDays = parsePositiveInteger(
    formData.get('service_interval_days')
  )
  const lastServiceDate = sanitizeValue(formData.get('last_service_date'))
  const inputNextServiceDate = sanitizeValue(formData.get('next_service_date'))
  const nextServiceDate =
    inputNextServiceDate ??
    (lastServiceDate && serviceIntervalDays
      ? addDays(lastServiceDate, serviceIntervalDays)
      : null)

  return {
    asset_no: sanitizeValue(formData.get('asset_no')),
    asset_name: sanitizeValue(formData.get('asset_name')),
    category_id: sanitizeValue(formData.get('category_id')),
    type: sanitizeValue(formData.get('type')),
    qr_code: sanitizeValue(formData.get('qr_code')),
    year: sanitizeValue(formData.get('year')),
    department: sanitizeValue(formData.get('department')),
    unit: sanitizeValue(formData.get('unit')),
    user_name: userName,
    purchase_date: sanitizeValue(formData.get('purchase_date')),
    price: sanitizeValue(formData.get('price')),
    supplier: sanitizeValue(formData.get('supplier')),
    source: sanitizeValue(formData.get('source')),
    model: sanitizeValue(formData.get('model')),
    serial_no: sanitizeValue(formData.get('serial_no')),
    processor: sanitizeValue(formData.get('processor')),
    ram_capacity: sanitizeValue(formData.get('ram_capacity')),
    hdd_capacity: sanitizeValue(formData.get('hdd_capacity')),
    monitor_model: sanitizeValue(formData.get('monitor_model')),
    monitor_serial_no: sanitizeValue(formData.get('monitor_serial_no')),
    monitor_asset_no: sanitizeValue(formData.get('monitor_asset_no')),
    keyboard_model: sanitizeValue(formData.get('keyboard_model')),
    keyboard_serial_no: sanitizeValue(formData.get('keyboard_serial_no')),
    keyboard_asset_no: sanitizeValue(formData.get('keyboard_asset_no')),
    mouse_model: sanitizeValue(formData.get('mouse_model')),
    mouse_serial_no: sanitizeValue(formData.get('mouse_serial_no')),
    mouse_asset_no: sanitizeValue(formData.get('mouse_asset_no')),
    accessories: sanitizeValue(formData.get('accessories')),
    maintenance_enabled: maintenanceEnabled,
    maintenance_strategy: maintenanceStrategy,
    maintenance_priority: maintenancePriority,
    service_interval_days: maintenanceEnabled ? serviceIntervalDays : null,
    last_service_date: maintenanceEnabled ? lastServiceDate : null,
    next_service_date: maintenanceEnabled ? nextServiceDate : null,
    warranty_expiry_date: sanitizeValue(formData.get('warranty_expiry_date')),
    expected_lifespan_years: parsePositiveInteger(
      formData.get('expected_lifespan_years')
    ),
    maintenance_notes: sanitizeValue(formData.get('maintenance_notes')),
  }
}

async function syncPreventiveSchedule(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  assetId: string,
  assetPayload: ReturnType<typeof buildAssetPayload>,
  actorId: string | null
) {
  const strategy = assetPayload.maintenance_strategy
  const enabled = assetPayload.maintenance_enabled
  const intervalDays = assetPayload.service_interval_days
  const nextServiceDate = assetPayload.next_service_date
  const lastServiceDate = assetPayload.last_service_date

  const { data: existingSchedule } = await supabase
    .from('maintenance_schedules')
    .select('id')
    .eq('asset_id', assetId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!enabled || strategy === 'corrective' || !intervalDays || !nextServiceDate) {
    if (existingSchedule?.id) {
      await supabase
        .from('maintenance_schedules')
        .update({ is_active: false })
        .eq('id', existingSchedule.id)
    }
    return
  }

  const schedulePayload = {
    asset_id: assetId,
    title: `Scheduled maintenance for ${assetPayload.asset_name ?? assetPayload.asset_no ?? 'asset'}`,
    description: assetPayload.maintenance_notes,
    maintenance_type: strategy === 'hybrid' ? 'preventive' : strategy,
    priority: assetPayload.maintenance_priority,
    interval_days: intervalDays,
    reminder_days_before: 7,
    last_service_date: lastServiceDate,
    next_due_date: nextServiceDate,
    auto_create_request: false,
    is_active: true,
    notes: assetPayload.maintenance_notes,
  }

  if (existingSchedule?.id) {
    await supabase
      .from('maintenance_schedules')
      .update(schedulePayload)
      .eq('id', existingSchedule.id)
  } else {
    await supabase.from('maintenance_schedules').insert({
      ...schedulePayload,
      created_by: actorId,
    })
  }
}

async function assertAssigneeExists(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  assignee: string | null,
  redirectTo: string
) {
  if (!assignee) {
    return
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', assignee)
    .maybeSingle()

  if (error || !data) {
    redirect(`${redirectTo}?error=assignee_not_found`)
  }
}

export async function createAsset(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/assets')
  const assetNo = sanitizeValue(formData.get('asset_no'))
  const assetName = sanitizeValue(formData.get('asset_name'))
  const userName = sanitizeValue(formData.get('user_name'))

  if (!assetNo || !assetName) {
    redirect(`${redirectTo}?error=missing_required_fields`)
  }

  const supabase = await createSupabaseServerClient()
  await assertAssigneeExists(supabase, userName, redirectTo)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const assetPayload = buildAssetPayload(formData, userName)
  const { data: createdAsset, error } = await supabase
    .from('assets')
    .insert({
      ...assetPayload,
      asset_no: assetNo,
      asset_name: assetName,
    })
    .select('id')
    .single()

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`)
  }

  if (createdAsset?.id) {
    await syncPreventiveSchedule(supabase, createdAsset.id, assetPayload, user?.id ?? null)
    await openAssetAssignmentHistory(supabase, {
      assetId: createdAsset.id,
      userName,
      startedBy: user?.id ?? null,
    })
  }

  revalidatePath(redirectTo)
  redirect(`${redirectTo}?saved=1`)
}

export async function updateAsset(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/assets')
  const id = sanitizeValue(formData.get('id'))
  const userName = sanitizeValue(formData.get('user_name'))

  if (!id) {
    redirect(`${redirectTo}?error=missing_asset_id`)
  }

  const supabase = await createSupabaseServerClient()
  await assertAssigneeExists(supabase, userName, redirectTo)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: existingAsset, error: existingAssetError } = await supabase
    .from('assets')
    .select('id, user_name')
    .eq('id', id)
    .maybeSingle()

  if (existingAssetError || !existingAsset) {
    redirect(`${redirectTo}?error=asset_not_found`)
  }

  const assetPayload = buildAssetPayload(formData, userName)
  const { error } = await supabase
    .from('assets')
    .update(assetPayload)
    .eq('id', id)

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`)
  }

  await syncPreventiveSchedule(supabase, id, assetPayload, user?.id ?? null)

  if (existingAsset.user_name !== userName) {
    if (existingAsset.user_name) {
      await closeActiveAssetAssignmentHistory(supabase, {
        assetId: id,
        endedBy: user?.id ?? null,
        endedReason: userName ? 'reassigned' : 'manual_unassign',
      })
    }

    if (userName) {
      await openAssetAssignmentHistory(supabase, {
        assetId: id,
        userName,
        startedBy: user?.id ?? null,
      })
    }
  }

  revalidatePath(redirectTo)
  redirect(`${redirectTo}?updated=1`)
}

export async function deleteAsset(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/assets')
  const id = sanitizeValue(formData.get('id'))

  if (!id) {
    redirect(`${redirectTo}?error=missing_asset_id`)
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  await closeActiveAssetAssignmentHistory(supabase, {
    assetId: id,
    endedBy: user?.id ?? null,
    endedReason: 'asset_deleted',
  })

  const { error } = await supabase.from('assets').delete().eq('id', id)

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(redirectTo)
  redirect(`${redirectTo}?deleted=1`)
}

export async function generateAssetQr(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/qr')
  const id = sanitizeValue(formData.get('id'))
  const assetNo = sanitizeValue(formData.get('asset_no'))
  const query = sanitizeValue(formData.get('q'))

  if (!id) {
    redirect(`${redirectTo}?error=missing_asset_id`)
  }

  const supabase = await createSupabaseServerClient()
  let code = assetNo

  if (!code) {
    const { data: assetRow, error: assetError } = await supabase
      .from('assets')
      .select('asset_no')
      .eq('id', id)
      .single()

    if (assetError) {
      redirect(`${redirectTo}?error=${encodeURIComponent(assetError.message)}`)
    }

    code = assetRow?.asset_no ?? id
  }

  const { error } = await supabase
    .from('assets')
    .update({ qr_code: code })
    .eq('id', id)

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(redirectTo)
  const params = new URLSearchParams({ qr: '1' })
  params.set('asset', id)
  if (query) {
    params.set('q', query)
  }
  redirect(`${redirectTo}?${params.toString()}`)
}

export async function removeAssetQr(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/qr')
  const id = sanitizeValue(formData.get('id'))

  if (!id) {
    redirect(`${redirectTo}?error=missing_asset_id`)
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('assets')
    .update({ qr_code: null })
    .eq('id', id)

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(redirectTo)
  const params = new URLSearchParams({
    removed: Date.now().toString(),
  })
  redirect(`${redirectTo}?${params.toString()}`)
}
