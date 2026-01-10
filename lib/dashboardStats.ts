import { createSupabaseServerClient } from './supabaseServer'

export async function getDashboardStats() {
  const supabase = createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const { count: totalAssets } = await supabase
    .from('assets')
    .select('id', { count: 'exact', head: true })

  const { count: activeAssets } = await supabase
    .from('assets')
    .select('id', { count: 'exact', head: true })
    .not('user_name', 'is', null)
    .neq('user_name', '')

  const { count: pendingMaintenance } = await supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: inProgressMaintenance } = await supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'in_progress')

  const { count: feedbackCount } = await supabase
    .from('feedback')
    .select('id', { count: 'exact', head: true })

  const { data: recentMaintenance } = await supabase
    .from('maintenance_requests')
    .select(
      `
      id,
      title,
      status,
      created_at,
      profiles ( full_name )
    `
    )
    .order('created_at', { ascending: false })
    .limit(3)

  const total = totalAssets ?? 0
  const active = activeAssets ?? 0
  const pending = pendingMaintenance ?? 0
  const inProgress = inProgressMaintenance ?? 0
  const maintenance = pending + inProgress
  const inactive = Math.max(total - active, 0)

  return {
    userName: profile?.full_name ?? 'Admin User',
    totalAssets: total,
    activeAssets: active,
    pendingMaintenance: pending,
    feedbackCount: feedbackCount ?? 0,
    recentMaintenance: recentMaintenance ?? [],
    statusOverview: {
      active,
      maintenance,
      inactive,
    },
  }
}
