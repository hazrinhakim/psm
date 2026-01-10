import { supabase } from './supabase'

export async function getAssets() {
  const { data, error } = await supabase
    .from('assets')
    .select(`
      id,
      asset_no,
      asset_name,
      year,
      department,
      unit,
      user_name,
      type,
      category_id,
      model,
      serial_no,
      processor,
      ram_capacity,
      hdd_capacity,
      monitor_model,
      monitor_serial_no,
      monitor_asset_no,
      keyboard_model,
      keyboard_serial_no,
      keyboard_asset_no,
      mouse_model,
      mouse_serial_no,
      mouse_asset_no,
      price,
      supplier,
      source,
      accessories,
      qr_code,
      purchase_date
    `)
    .order('asset_name')

  if (error) {
    console.error(error)
    return []
  }

  return data
}
