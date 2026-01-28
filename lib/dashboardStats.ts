import { createSupabaseServerClient } from './supabaseServer'

type DashboardScope = 'all' | 'assigned'

export async function getDashboardStats(scope: DashboardScope = 'all') {
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

  const isScoped = scope === 'assigned'
  const assignee = profile?.full_name?.trim()
  const userId = user?.id ?? '00000000-0000-0000-0000-000000000000'
  const assigneeMatch = assignee || '__missing__'

  let totalAssetsQuery = supabase
    .from('assets')
    .select('id', { count: 'exact', head: true })
  if (isScoped) {
    totalAssetsQuery = totalAssetsQuery.eq('user_name', assigneeMatch)
  }
  const { count: totalAssets } = await totalAssetsQuery

  const { count: activeAssets } = isScoped
    ? await supabase
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .eq('user_name', assigneeMatch)
    : await supabase
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .not('user_name', 'is', null)
        .neq('user_name', '')

  let pendingMaintenanceQuery = supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Pending')
  if (isScoped) {
    pendingMaintenanceQuery = pendingMaintenanceQuery.eq('requested_by', userId)
  }
  const { count: pendingMaintenance } = await pendingMaintenanceQuery

  let inProgressMaintenanceQuery = supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'In Progress')
  if (isScoped) {
    inProgressMaintenanceQuery = inProgressMaintenanceQuery.eq(
      'requested_by',
      userId
    )
  }
  const { count: inProgressMaintenance } = await inProgressMaintenanceQuery

  let completedMaintenanceQuery = supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Resolved')
  if (isScoped) {
    completedMaintenanceQuery = completedMaintenanceQuery.eq(
      'requested_by',
      userId
    )
  }
  const { count: completedMaintenance } = await completedMaintenanceQuery

  const { count: feedbackCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'general')
    .eq('read', false)

  let recentMaintenanceQuery = supabase
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
  if (isScoped) {
    recentMaintenanceQuery = recentMaintenanceQuery.eq('requested_by', userId)
  }
  const { data: recentMaintenance } = await recentMaintenanceQuery

  const total = totalAssets ?? 0
  const active = activeAssets ?? 0
  const pending = pendingMaintenance ?? 0
  const inProgress = inProgressMaintenance ?? 0
  const maintenance = pending + inProgress
  const inactive = Math.max(total - active, 0)

  return {
    userName: profile?.full_name ?? (isScoped ? 'Staff User' : 'Admin User'),
    totalAssets: total,
    activeAssets: active,
    pendingMaintenance: pending,
    inProgressMaintenance: inProgress,
    completedMaintenance: completedMaintenance ?? 0,
    feedbackCount: feedbackCount ?? 0,
    recentMaintenance: recentMaintenance ?? [],
    statusOverview: {
      active,
      maintenance,
      inactive,
    },
  }
}
