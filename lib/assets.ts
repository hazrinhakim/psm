import { supabase } from './supabase'

export async function getAssets() {
  const { data, error } = await supabase
    .from('assets')
    .select(`
      id,
      asset_no,
      asset_name,
      type,
      asset_categories ( name )
    `)
    .order('asset_name')

  if (error) {
    console.error(error)
    return []
  }

  return data
}
