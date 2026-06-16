import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

type NotificationItem = {
  id: string
  message?: string | null
  type?: string | null
  date?: string | null
  read?: boolean | null
}

function cleanNotificationMessage(message?: string | null) {
  return (message ?? 'No details provided.')
    .replace(/^\[feedback:[a-f0-9-]+\]\s*/i, '')
    .replace(/^\[maintenance:[a-f0-9-]+\]\s*/i, '')
    .replace(/^\[schedule:[a-f0-9-]+\]\[alert:[a-z_]+\]\s*/i, '')
}

export default async function StaffNotificationsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, message, type, date, read')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Notifications
        </h1>
      </div>

      {!notifications?.length && (
        <p className="text-sm text-muted-foreground">
          You have no notifications yet.
        </p>
      )}

      <div className="grid gap-4">
        {notifications?.map((note: NotificationItem) => (
          <Card key={note.id}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">
                {note.type ? `${note.type} update` : 'System update'}
              </CardTitle>
              <CardDescription>
                {note.date
                  ? new Date(note.date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                    })
                  : 'Date unavailable'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {cleanNotificationMessage(note.message)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
