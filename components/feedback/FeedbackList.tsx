import { FeedbackItem } from '@/components/feedback/FeedbackItem'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'

type FeedbackEntry = {
  id: string
  message?: string | null
  role?: string | null
  email?: string | null
  created_at?: string | null
  created_by?: string | null
}

type ProfileEntry = {
  id: string
  full_name?: string | null
}

type NotificationEntry = {
  message?: string | null
}

export async function FeedbackList() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="space-y-2 animate-in fade-in duration-700">
        <h1 className="text-2xl font-semibold tracking-tight">
          Feedback
        </h1>
        <p className="text-sm text-muted-foreground">
          Only administrators can view feedback submissions.
        </p>
      </div>
    )
  }

  const adminClient = createSupabaseAdminClient()
  const client = adminClient ?? supabase

  const { data: unreadNotifications } = await supabase
    .from('notifications')
    .select('message')
    .eq('user_id', user.id)
    .eq('type', 'general')
    .eq('read', false)

  const unreadFeedbackIds = new Set(
    (unreadNotifications as NotificationEntry[] | null ?? [])
      .map(note => {
        const message = note.message ?? ''
        const match = message.match(/\[feedback:([a-f0-9-]+)\]/i)
        return match ? match[1] : null
      })
      .filter(Boolean)
  )

  const { data: feedback, error } = await client
    .from('feedback')
    .select(
      `
      id,
      message,
      role,
      email,
      created_at,
      created_by
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="space-y-2 animate-in fade-in duration-700">
        <h1 className="text-2xl font-semibold tracking-tight">
          Feedback
        </h1>
        <p className="text-sm text-muted-foreground">
          Unable to load feedback. Please try again later.
        </p>
      </div>
    )
  }

  const createdByIds = Array.from(
    new Set((feedback as FeedbackEntry[] | null ?? []).map(entry => entry.created_by))
  ).filter(Boolean)

  const { data: profiles } = createdByIds.length
    ? await client
        .from('profiles')
        .select('id, full_name')
        .in('id', createdByIds)
    : { data: [] }

  const profileMap = new Map(
    (profiles as ProfileEntry[] | null ?? []).map(entry => [entry.id, entry.full_name])
  )

  const emailMap = new Map<string, string>()
  if (adminClient && createdByIds.length > 0) {
    const emails = await Promise.all(
      createdByIds.map(async id => {
        const { data, error: userError } =
          await adminClient.auth.admin.getUserById(id)
        if (userError || !data?.user?.email) {
          return [id, null] as const
        }
        return [id, data.user.email] as const
      })
    )
    emails.forEach(([id, email]) => {
      if (email) {
        emailMap.set(id, email)
      }
    })
  }

  const getDisplayName = (entry: FeedbackEntry) =>
    profileMap.get(entry.created_by) ??
    entry.email ??
    emailMap.get(entry.created_by) ??
    'Staff member'

  const getDisplayEmail = (entry: FeedbackEntry) =>
    entry.email ?? emailMap.get(entry.created_by) ?? null

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="space-y-1 animate-in slide-in-from-left-4 duration-700">
        <h1 className="text-2xl font-semibold tracking-tight">
          Feedback
        </h1>
        <p className="text-sm text-muted-foreground">
          Review suggestions and comments submitted by staff.
        </p>
      </div>

      {!feedback?.length && (
        <p className="text-sm text-muted-foreground">
          No feedback has been submitted yet.
        </p>
      )}

      <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
        {(feedback as FeedbackEntry[] | null)?.map(entry => {
          const displayName = getDisplayName(entry)
          const displayEmail = getDisplayEmail(entry)
          const dateLabel = entry.created_at
            ? new Date(entry.created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              })
            : 'Date unavailable'
          const detailDateLabel = entry.created_at
            ? new Date(entry.created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Date unavailable'

          return (
            <FeedbackItem
              key={entry.id}
              name={displayName}
              email={displayEmail}
              role={entry.role ?? 'staff'}
              dateLabel={dateLabel}
              detailDateLabel={detailDateLabel}
              message={entry.message}
              isUnread={unreadFeedbackIds.has(entry.id)}
              feedbackId={entry.id}
            />
          )
        })}
      </div>
    </div>
  )
}
