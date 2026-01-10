import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SonnerNotifier } from '@/components/ui/sonner-notifier'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { deleteUser, inviteUser, updateUserRole } from './actions'
import { normalizeRole } from '@/lib/roles'
import { Search, Trash2, UserPlus, Pencil } from 'lucide-react'

type SearchParams = {
  invited?: string
  updated?: string
  deleted?: string
  error?: string
  q?: string
}

function getLoginId(email?: string | null, fallback?: string | null) {
  if (fallback) {
    return fallback
  }
  if (!email) {
    return '-'
  }
  return email.split('@')[0] || email
}

function getRoleBadgeClass(role: string) {
  if (role === 'admin') {
    return 'bg-blue-100 text-blue-700 border-transparent'
  }
  if (role === 'admin_assistant') {
    return 'bg-purple-100 text-purple-700 border-transparent'
  }
  return 'bg-emerald-100 text-emerald-700 border-transparent'
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const supabase = createSupabaseAdminClient()
  const supabaseServer = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabaseServer.auth.getUser()
  const { data: profile } = user
    ? await supabaseServer
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }
  const invited = searchParams?.invited === '1'
  const updated = searchParams?.updated === '1'
  const deleted = searchParams?.deleted === '1'
  const query = (searchParams?.q ?? '').trim().toLowerCase()
  let errorMessage: string | undefined

  if (searchParams?.error) {
    try {
      errorMessage = decodeURIComponent(searchParams.error)
    } catch {
      errorMessage = searchParams.error
    }
  }

  if (!supabase) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {profile?.full_name ?? 'Admin User'}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Manage users
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage system users and their roles.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supabase admin key required</CardTitle>
            <CardDescription>
              Set SUPABASE_SERVICE_ROLE_KEY to enable user management.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { data, error } = await supabase.auth.admin.listUsers({
    perPage: 100,
    page: 1,
  })

  const users = data?.users ?? []
  const userIds = users.map(user => user.id)
  const { data: profiles } = userIds.length
    ? await supabase
        .from('profiles')
        .select('id, role, full_name')
        .in('id', userIds)
    : { data: [] }

  const profileMap = new Map(
    (profiles ?? []).map(profile => [
      profile.id,
      {
        role: normalizeRole(profile.role),
        fullName: profile.full_name ?? null,
      },
    ])
  )

  const filteredUsers = query
    ? users.filter(user => {
        const profileEntry = profileMap.get(user.id)
        const role = profileEntry?.role ?? 'staff'
        const name =
          profileEntry?.fullName ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          ''
        const loginId = getLoginId(
          user.email,
          user.user_metadata?.username ?? null
        )
        const haystack = [
          name,
          user.email ?? '',
          loginId,
          role.replace('_', ' '),
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(query)
      })
    : users

  const displayName = profile?.full_name ?? 'Admin User'

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {displayName}.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Manage users
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage system users and their roles.
          </p>
        </div>
        <Button asChild className="gap-2">
          <a href="#invite">
            <UserPlus className="h-4 w-4" />
            Add User
          </a>
        </Button>
      </div>

      {(invited || updated || deleted || errorMessage || error) && (
        <SonnerNotifier
          title={
            invited
              ? 'Invite sent'
              : updated
                ? 'Role updated'
                : deleted
                  ? 'User removed'
                  : 'Action needed'
          }
          message={
            invited
              ? 'Invitation email sent successfully.'
              : updated
                ? 'User role updated successfully.'
                : deleted
                  ? 'User removed from the system.'
                  : errorMessage || error?.message || 'Unable to complete action.'
          }
          variant={
            errorMessage || error
              ? 'error'
              : deleted
                ? 'warning'
                : 'success'
          }
          toastId={`users-${errorMessage || error ? 'error' : deleted ? 'deleted' : 'updated'}`}
        />
      )}

      <Card id="invite">
        <CardHeader>
          <CardTitle>Invite a user</CardTitle>
          <CardDescription>
            Send an email invite to create a new account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={inviteUser}
            className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                placeholder="user@company.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                name="role"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                defaultValue="staff"
              >
                <option value="admin">Admin</option>
                <option value="admin_assistant">Admin Assistant</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Send invite
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form method="get" className="flex w-full items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search users..."
                defaultValue={query}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardDescription>
            {filteredUsers.length
              ? `Showing ${filteredUsers.length} users.`
              : 'No users found yet.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="py-3 pr-3 font-medium">Login ID</th>
                <th className="py-3 pr-3 font-medium">Name</th>
                <th className="py-3 pr-3 font-medium">Email</th>
                <th className="py-3 pr-3 font-medium">Role</th>
                <th className="py-3 pr-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const profileEntry = profileMap.get(user.id)
                const name =
                  profileEntry?.fullName ||
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  '-'
                const role = profileEntry?.role ?? 'staff'
                const loginId = getLoginId(
                  user.email,
                  user.user_metadata?.username ?? null
                )

                return (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="py-4 pr-3 font-medium text-foreground">
                      {loginId}
                    </td>
                    <td className="py-4 pr-3">{name}</td>
                    <td className="py-4 pr-3">{user.email ?? '-'}</td>
                    <td className="py-4 pr-3">
                      <Badge className={getRoleBadgeClass(role)}>
                        {role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-1">
                        <details className="relative">
                          <summary className="list-none">
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                          </summary>
                          <Card className="absolute right-0 z-10 mt-2 w-44 origin-top-right shadow-lg">
                            <CardContent className="space-y-2 p-3">
                              <form action={updateUserRole} className="space-y-2">
                                <input type="hidden" name="user_id" value={user.id} />
                                <select
                                  name="role"
                                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                                  defaultValue={role}
                                >
                                  <option value="admin">Admin</option>
                                  <option value="admin_assistant">Admin Assistant</option>
                                  <option value="staff">Staff</option>
                                </select>
                                <Button type="submit" size="sm" className="w-full">
                                  Save
                                </Button>
                              </form>
                            </CardContent>
                          </Card>
                        </details>
                        <form action={deleteUser}>
                          <input type="hidden" name="user_id" value={user.id} />
                          <Button variant="ghost" size="icon" type="submit">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
