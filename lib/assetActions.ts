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

export async function createAsset(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/assets')
  const assetNo = sanitizeValue(formData.get('asset_no'))
  const assetName = sanitizeValue(formData.get('asset_name'))

  if (!assetNo || !assetName) {
    redirect(`${redirectTo}?error=missing_required_fields`)
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('assets').insert({
    asset_no: assetNo,
    asset_name: assetName,
    category_id: sanitizeValue(formData.get('category_id')),
    type: sanitizeValue(formData.get('type')),
    qr_code: sanitizeValue(formData.get('qr_code')),
    year: sanitizeValue(formData.get('year')),
    department: sanitizeValue(formData.get('department')),
    unit: sanitizeValue(formData.get('unit')),
    user_name: sanitizeValue(formData.get('user_name')),
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
  })

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(redirectTo)
  redirect(`${redirectTo}?saved=1`)
}

export async function updateAsset(formData: FormData) {
  const redirectTo = getRedirectPath(formData, '/admin/assets')
  const id = sanitizeValue(formData.get('id'))

  if (!id) {
    redirect(`${redirectTo}?error=missing_asset_id`)
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('assets')
    .update({
      asset_no: sanitizeValue(formData.get('asset_no')),
      asset_name: sanitizeValue(formData.get('asset_name')),
      category_id: sanitizeValue(formData.get('category_id')),
      type: sanitizeValue(formData.get('type')),
      qr_code: sanitizeValue(formData.get('qr_code')),
      year: sanitizeValue(formData.get('year')),
      department: sanitizeValue(formData.get('department')),
      unit: sanitizeValue(formData.get('unit')),
      user_name: sanitizeValue(formData.get('user_name')),
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
    })
    .eq('id', id)

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`)
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

  const supabase = createSupabaseServerClient()
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

  const supabase = createSupabaseServerClient()
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
