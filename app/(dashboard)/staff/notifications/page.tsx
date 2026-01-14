import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export default async function StaffNotificationsPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Please sign in to view your notifications.
          </CardDescription>
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
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground">
          Updates about maintenance, warranties, and scheduled work.
        </p>
      </div>

      {!notifications?.length && (
        <p className="text-sm text-muted-foreground">
          You have no notifications yet.
        </p>
      )}

      <div className="grid gap-4">
        {notifications?.map((note: any) => (
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
              {note.message ?? 'No details provided.'}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
