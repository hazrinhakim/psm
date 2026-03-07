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
import { 
  Search, 
  Trash2, 
  Pencil, 
  Mail, 
  Users,
  Sparkles,
  UserCircle
} from 'lucide-react'
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

// Badge classes - SAMA SEPERTI ASAL, langsung tak diubah
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
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{profile?.full_name ?? 'Admin User'}</span>.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Manage users</h2>
            <p className="text-sm text-muted-foreground">
              Manage system users and their roles.
            </p>
          </div>
        </div>

        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-amber-100/50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Supabase admin key required
            </CardTitle>
            <CardDescription className="text-amber-700">
              Set <code className="rounded bg-amber-200/50 px-2 py-1 font-mono text-sm">SUPABASE_SERVICE_ROLE_KEY</code> to enable user management.
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
    <div className="space-y-8 p-1 animate-in fade-in duration-700">
      {/* Header Section - with slide in animation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in slide-in-from-left-4 duration-700">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold">
                User Management
              </h2>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 animate-in slide-in-from-right-4 duration-700">
          <InviteUserDialog />
        </div>
      </div>

      {/* Notification - with fade and slide */}
      {(invited || updated || deleted || errorMessage || error) && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
          <SonnerNotifier
            title={
              invited
                ? '✨ Invitation sent successfully'
                : updated
                  ? '✅ Role updated successfully'
                  : deleted
                    ? '👋 User removed successfully'
                    : '⚠️ Action needed'
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
        </div>
      )}

      {/* Search Field - with fade in */}
      <form
        method="get"
        className="flex w-full flex-col gap-3 sm:flex-row sm:items-center animate-in fade-in slide-in-from-bottom-2 duration-700"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Search users by name, email, or role..."
            defaultValue={query}
            className="h-10 rounded-full border-muted pl-11 pr-4 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 transition-all bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            type="submit" 
            className="h-10 gap-2 bg-black hover:bg-stone-600 shadow-md hover:shadow-lg transition-all duration-200 px-6"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 border-2 hover:bg-gray-100 transition-colors px-6"
          >
            <a href="?">Clear</a>
          </Button>
        </div>
      </form>

      {/* Users Table Card - with fade in and slide up */}
      <Card className="border-2 border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white px-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                All Users
              </CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>
                {filteredUsers.length
                  ? `Showing ${filteredUsers.length} active ${filteredUsers.length === 1 ? 'user' : 'users'}`
                  : 'No users found'}
              </span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr className="border-b">
                  <th className="py-4 pl-6 pr-3 font-medium">Name</th>
                  <th className="py-4 px-3 font-medium">Email</th>
                  <th className="py-4 px-3 font-medium">Role</th>
                  <th className="py-4 px-5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 shadow-inner">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700">No users found</p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                          Try adjusting your search or invite new team members.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const profileEntry = profileMap.get(user.id)
                    const name =
                      profileEntry?.fullName ||
                      user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      '-'
                    const role = profileEntry?.role ?? 'staff'
                    const initials = name !== '-' 
                      ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                      : 'U'

                    return (
                      <tr 
                        key={user.id} 
                        className="border-b last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-150 animate-in fade-in slide-in-from-left-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="py-4 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium border border-gray-300">
                              {initials}
                            </div>
                            <span className="font-medium text-gray-800">{name}</span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-gray-600">{user.email ?? '-'}</span>
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          {/* BADGE - SAMA SEPERTI ASAL, langsung tak diubah */}
                          <Badge className={getRoleBadgeClass(role)}>
                            {role.replace('_', ' ')}
                          </Badge>
                        </td>

                        <td className="py-4 px-3">
                          <div className="flex">
                            {/* Edit Dropdown */}
                            <details className="relative">
                              <summary className="list-none cursor-pointer">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors">
                                  <Pencil className="h-4 w-4 text-blue-600" />
                                </div>
                              </summary>
                              <Card className="absolute right-0 z-10 mt-2 w-48 origin-top-right shadow-xl border-2">
                                <CardContent className="space-y-2 p-3">
                                  <form action={updateUserRole} className="space-y-2">
                                    <input type="hidden" name="user_id" value={user.id} />
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      Select role
                                    </p>
                                    <select
                                      name="role"
                                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus:ring-2 focus:ring-blue-500"
                                      defaultValue={role}
                                    >
                                      <option value="admin">Admin</option>
                                      <option value="admin_assistant">Admin Assistant</option>
                                      <option value="staff">Staff</option>
                                    </select>
                                    <Button type="submit" size="sm" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                                      Save Changes
                                    </Button>
                                  </form>
                                </CardContent>
                              </Card>
                            </details>

                            {/* Delete Form */}
                            <form action={deleteUser}>
                              <input type="hidden" name="user_id" value={user.id} />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                type="submit"
                                className="h-9 w-9 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </form>
                          </div>
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

      {/* Pagination - with fade in and slide up */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
          <Pagination className="mx-0 w-auto order-1 sm:order-2">
            <PaginationContent className="gap-2">
              <PaginationItem>
                <PaginationPrevious
                  href={pageHref(Math.max(1, currentPage - 1))}
                  className={`rounded-full border hover:bg-gray-50 transition-colors ${
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
                      className={`rounded-full border transition-colors ${
                        pageNum === currentPage 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-md' 
                          : 'hover:bg-gray-50'
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
                  className={`rounded-full border hover:bg-gray-50 transition-colors ${
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
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