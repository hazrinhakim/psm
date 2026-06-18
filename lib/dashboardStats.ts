import { getCurrentUserContext } from './currentUser'
import { createSupabaseAdminClient } from './supabaseAdmin'

type DashboardScope = 'all' | 'assigned'

type RawRecentMaintenanceItem = {
  id: string
  title?: string | null
  status?: string | null
  created_at?: string | null
  requested_by?: string | null
}

export async function getDashboardStats(scope: DashboardScope = 'all') {
  const { supabase, user, profile } = await getCurrentUserContext()

  const isScoped = scope === 'assigned'
  const assignee = profile?.full_name?.trim()
  const userId = user?.id ?? '00000000-0000-0000-0000-000000000000'
  const assigneeMatch = assignee || '__missing__'
  const role = profile?.role ?? null
  const adminClient =
    !isScoped && (role === 'admin' || role === 'admin_assistant')
      ? createSupabaseAdminClient()
      : null
  const dataClient = adminClient ?? supabase

  let totalAssetsQuery = dataClient
    .from('assets')
    .select('id', { count: 'exact', head: true })
  if (isScoped) {
    totalAssetsQuery = totalAssetsQuery.eq('user_name', assigneeMatch)
  }
  const activeAssetsQuery = isScoped
    ? supabase
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .eq('user_name', assigneeMatch)
    : dataClient
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .not('user_name', 'is', null)
        .neq('user_name', '')

  let pendingMaintenanceQuery = dataClient
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Pending')
  if (isScoped) {
    pendingMaintenanceQuery = pendingMaintenanceQuery.eq('requested_by', userId)
  }

  let inProgressMaintenanceQuery = dataClient
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'In Progress')
  if (isScoped) {
    inProgressMaintenanceQuery = inProgressMaintenanceQuery.eq(
      'requested_by',
      userId
    )
  }

  let completedMaintenanceQuery = dataClient
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Resolved')
  if (isScoped) {
    completedMaintenanceQuery = completedMaintenanceQuery.eq(
      'requested_by',
      userId
    )
  }

  let recentMaintenanceQuery = dataClient
    .from('maintenance_requests')
    .select(
      `
      id,
      title,
      status,
      created_at,
      requested_by
    `
    )
    .eq('status', 'Pending')
    .order('created_at', { ascending: false })
    .limit(3)
  if (isScoped) {
    recentMaintenanceQuery = recentMaintenanceQuery.eq('requested_by', userId)
  }

  const [
    { count: totalAssets },
    { count: activeAssets },
    { count: pendingMaintenance },
    { count: inProgressMaintenance },
    { count: completedMaintenance },
    { count: feedbackCount },
    { data: recentMaintenance },
  ] = await Promise.all([
    totalAssetsQuery,
    activeAssetsQuery,
    pendingMaintenanceQuery,
    inProgressMaintenanceQuery,
    completedMaintenanceQuery,
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'general')
      .eq('read', false),
    recentMaintenanceQuery,
  ])

  const requesterIds = Array.from(
    new Set(
      ((recentMaintenance ?? []) as RawRecentMaintenanceItem[])
        .map(request => request.requested_by)
        .filter((value): value is string => Boolean(value))
    )
  )

  const { data: requesterProfiles } =
    requesterIds.length > 0
      ? await dataClient
          .from('profiles')
          .select('id, full_name')
          .in('id', requesterIds)
      : { data: [] }

  const requesterMap = new Map(
    (requesterProfiles ?? []).map(profile => [profile.id, profile.full_name ?? null])
  )

  const normalizedRecentMaintenance = (
    (recentMaintenance ?? []) as RawRecentMaintenanceItem[]
  ).map(request => ({
    ...request,
    profiles: {
      full_name: request.requested_by
        ? (requesterMap.get(request.requested_by) ?? null)
        : null,
    },
  }))

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
    recentMaintenance: normalizedRecentMaintenance,
    statusOverview: {
      active,
      maintenance,
      inactive,
    },
  }
}
