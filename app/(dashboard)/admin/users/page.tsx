import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SonnerNotifier } from '@/components/ui/sonner-notifier'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { deleteUser, updateUserRole } from './actions'
import { normalizeRole } from '@/lib/roles'
import { Mail, Users } from 'lucide-react'
import { InviteUserDialog } from './InviteUserDialog'
import { UserSearchForm } from './UserSearchForm'
import { UserRowActions } from './UserRowActions'

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
    return 'bg-blue-100 text-blue-700 border-transparent dark:bg-blue-500/15 dark:text-blue-200'
  }
  if (role === 'admin_assistant') {
    return 'bg-purple-100 text-purple-700 border-transparent dark:bg-purple-500/15 dark:text-purple-200'
  }
  return 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-500/15 dark:text-emerald-200'
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const resolvedSearchParams = await searchParams
  const supabase = createSupabaseAdminClient()

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
      <div className="space-y-6 p-1">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            User Management
          </h1>
        </div>

        <Card className="border-amber-200 bg-amber-50/60 shadow-none dark:border-amber-500/30 dark:bg-amber-500/10">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200">
              Supabase admin key required
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-200/85">
              Set{' '}
              <code className="rounded bg-amber-200/50 px-2 py-1 font-mono text-sm dark:bg-amber-500/15">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{' '}
              to enable user management.
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
    <div className="space-y-6 p-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            User Management
          </h2>
        </div>
        <InviteUserDialog />
      </div>

      {(invited || updated || deleted || errorMessage || error) && (
        <SonnerNotifier
          title={
            invited
              ? 'Invitation sent'
              : updated
                ? 'Role updated'
                : deleted
                  ? 'User removed'
                  : 'Action needed'
          }
          message={
            invited
              ? 'Invitation email has been sent to the user.'
              : updated
                ? 'User role has been updated in the system.'
                : deleted
                  ? 'User has been removed from the system.'
                  : errorMessage || error?.message || 'Unable to complete the action.'
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

      <UserSearchForm query={query} />

      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="px-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">All Users</CardTitle>
            </div>
            <CardDescription className="mt-1">
              {filteredUsers.length
                ? `Showing ${filteredUsers.length} active ${filteredUsers.length === 1 ? 'user' : 'users'}`
                : 'No users found'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr className="border-b">
                  <th className="py-4 pl-6 pr-3 font-medium">Name</th>
                  <th className="px-3 py-4 font-medium">Email</th>
                  <th className="px-3 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md border bg-muted/40">
                          <Users className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          No users found
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                          Try adjusting your search or invite new team members.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const profileEntry = profileMap.get(user.id)
                    const name =
                      profileEntry?.fullName ||
                      user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      '-'
                    const role = profileEntry?.role ?? 'staff'
                    const initials =
                      name !== '-'
                        ? name
                            .split(' ')
                            .map((part: string) => part[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : 'U'

                    return (
                      <tr
                        key={user.id}
                        className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                      >
                        <td className="py-4 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium text-foreground">
                              {initials}
                            </div>
                            <span className="font-medium text-foreground">
                              {name}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {user.email ?? '-'}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <Badge className={getRoleBadgeClass(role)}>
                            {role.replace('_', ' ')}
                          </Badge>
                        </td>

                        <td className="px-3 py-4">
                          <UserRowActions
                            userId={user.id}
                            role={role}
                            updateUserRole={updateUserRole}
                            deleteUser={deleteUser}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="order-2 text-sm text-muted-foreground sm:order-1">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
          <Pagination className="order-1 mx-0 w-auto sm:order-2">
            <PaginationContent className="gap-2">
              <PaginationItem>
                <PaginationPrevious
                  href={pageHref(Math.max(1, currentPage - 1))}
                  className={`rounded-md border transition-colors hover:bg-muted ${
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }`}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href={pageHref(pageNum)}
                      isActive={pageNum === currentPage}
                      className={`rounded-md border transition-colors ${
                        pageNum === currentPage
                          ? 'border-foreground bg-foreground text-background'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationNext
                  href={pageHref(Math.min(totalPages, currentPage + 1))}
                  className={`rounded-md border transition-colors hover:bg-muted ${
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
