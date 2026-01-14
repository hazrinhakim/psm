import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SonnerNotifier } from '@/components/ui/sonner-notifier'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { deleteUser, updateUserRole } from './actions'
import { normalizeRole } from '@/lib/roles'
import { Search, Trash2, Pencil } from 'lucide-react'
import { InviteUserDialog } from './InviteUserDialog'

type SearchParams = {
  invited?: string
  updated?: string
  deleted?: string
  error?: string
  q?: string
  page?: string
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
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams)
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
  const invited = resolvedSearchParams?.invited === '1'
  const updated = resolvedSearchParams?.updated === '1'
  const deleted = resolvedSearchParams?.deleted === '1'
  const query = (resolvedSearchParams?.q ?? '').trim().toLowerCase()
  const pageSize = 10
  const currentPage = Math.max(
    1,
    Number.parseInt(resolvedSearchParams?.page ?? '1', 10) || 1
  )
  let errorMessage: string | undefined

  if (resolvedSearchParams?.error) {
    try {
      errorMessage = decodeURIComponent(resolvedSearchParams.error)
    } catch {
      errorMessage = resolvedSearchParams.error
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
    perPage: pageSize,
    page: currentPage,
  })

  const users = data?.users ?? []
  const totalUsers =
    data && 'total' in data
      ? Number(data.total ?? users.length)
      : users.length
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize))
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
  const baseQuery = new URLSearchParams()
  if (resolvedSearchParams?.q) {
    baseQuery.set('q', resolvedSearchParams.q)
  }
  const pageHref = (page: number) => {
    const params = new URLSearchParams(baseQuery)
    params.set('page', String(page))
    return `?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            User Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage system users and their roles.
          </p>
        </div>
        <InviteUserDialog />
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


        <CardContent className="pt-6">
          <form
            method="get"
            className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search users..."
                defaultValue={query}
                className="h-11 rounded-full border-muted pl-11 pr-4 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" className="h-11 rounded-full gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-11 rounded-full"
              >
                <a href="?">Clear</a>
              </Button>
            </div>
          </form>
        </CardContent>


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

                return (
                  <tr key={user.id} className="border-b last:border-b-0">
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

      {totalPages > 1 && (
        <Pagination className="pt-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={pageHref(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
            {totalPages <= 5 ? (
              Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={pageHref(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })
            ) : (
              <>
                <PaginationItem>
                  <PaginationLink
                    href={pageHref(1)}
                    isActive={currentPage === 1}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {currentPage > 2 && currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationLink href={pageHref(currentPage)} isActive>
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                )}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    href={pageHref(totalPages)}
                    isActive={currentPage === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            <PaginationItem>
              <PaginationNext
                href={pageHref(Math.min(totalPages, currentPage + 1))}
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
