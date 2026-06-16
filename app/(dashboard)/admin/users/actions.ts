'use server'

import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { normalizeRole } from '@/lib/roles'

function resolveSiteUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, '')
  }

  const vercelProductionUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProductionUrl) {
    return `https://${vercelProductionUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`
  }

  const vercelPreviewUrl = process.env.VERCEL_URL?.trim()
  if (vercelPreviewUrl) {
    return `https://${vercelPreviewUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}`
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000'
  }

  return null
}

export async function inviteUser(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const role = normalizeRole(
    String(formData.get('role') ?? 'staff').trim()
  )

  if (!email) {
    redirect('/admin/users?error=missing_email')
  }

  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    redirect('/admin/users?error=missing_service_role_key')
  }

  const siteUrl = resolveSiteUrl()
  if (!siteUrl) {
    redirect('/admin/users?error=missing_site_url')
  }

  const redirectTo = `${siteUrl}/register`

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      role,
    },
  })

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`)
  }

  if (data?.user?.id) {
    await supabase
      .from('profiles')
      .upsert({ id: data.user.id, role }, { onConflict: 'id' })
  }

  redirect('/admin/users?invited=1')
}

export async function updateUserRole(formData: FormData) {
  const userId = String(formData.get('user_id') ?? '').trim()
  const role = normalizeRole(
    String(formData.get('role') ?? 'staff').trim()
  )

  if (!userId) {
    redirect('/admin/users?error=missing_user_id')
  }

  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    redirect('/admin/users?error=missing_service_role_key')
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, role }, { onConflict: 'id' })

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/admin/users?updated=1')
}

export async function deleteUser(formData: FormData) {
  const userId = String(formData.get('user_id') ?? '').trim()

  if (!userId) {
    redirect('/admin/users?error=missing_user_id')
  }

  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    redirect('/admin/users?error=missing_service_role_key')
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle()

  const fullName = profileData?.full_name?.trim() || null

  if (fullName) {
    const { data: assignedAssets, error: assignedAssetsError } = await supabase
      .from('assets')
      .select('id')
      .eq('user_name', fullName)

    if (assignedAssetsError) {
      redirect(`/admin/users?error=${encodeURIComponent(assignedAssetsError.message)}`)
    }

    const assetIds = (assignedAssets ?? []).map(asset => asset.id)

    if (assetIds.length > 0) {
      const { error: historyError } = await supabase
        .from('asset_assignment_history')
        .update({
          unassigned_at: new Date().toISOString(),
          ended_reason: 'user_deleted',
        })
        .in('asset_id', assetIds)
        .is('unassigned_at', null)

      if (historyError) {
        redirect(`/admin/users?error=${encodeURIComponent(historyError.message)}`)
      }

      const { error: unassignError } = await supabase
        .from('assets')
        .update({ user_name: null })
        .eq('user_name', fullName)

      if (unassignError) {
        redirect(`/admin/users?error=${encodeURIComponent(unassignError.message)}`)
      }
    }
  }

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`)
  }

  await supabase.from('profiles').delete().eq('id', userId)

  redirect('/admin/users?deleted=1')
}
