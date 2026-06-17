import { cache } from 'react'
import { normalizeRole, roleToPath, type UserRole } from '@/lib/roles'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

type CurrentUserProfile = {
  role?: string | null
  full_name?: string | null
}

export const getCurrentUserContext = cache(async () => {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const normalizedRole = normalizeRole(profile?.role)

  return {
    supabase,
    user,
    profile: (profile ?? null) as CurrentUserProfile | null,
    role: normalizedRole as UserRole,
    basePath: roleToPath(normalizedRole),
    profileName: profile?.full_name?.trim() || user?.email || 'User',
  }
})
