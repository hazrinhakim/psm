export type UserRole = 'admin' | 'admin_assistant' | 'staff'

const rolePaths: Record<UserRole, string> = {
  admin: '/admin',
  admin_assistant: '/assistant',
  staff: '/staff',
}

export function normalizeRole(value?: string | null): UserRole {
  if (value === 'admin' || value === 'admin_assistant') {
    return value
  }
  return 'staff'
}

export function roleToPath(role?: string | null) {
  return rolePaths[normalizeRole(role)]
}

export function isRolePath(pathname: string, role: UserRole) {
  return pathname.startsWith(rolePaths[role])
}

