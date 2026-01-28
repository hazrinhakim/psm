'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'

type NotificationItem = {
  id: string
  message: string | null
  type: string | null
  date: string | null
  read: boolean | null
}

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null
  )
  const notificationsChannel = useRef<ReturnType<typeof supabase.channel> | null>(
    null
  )

  useEffect(() => {
    let isActive = true
    const loadNotifications = async (limit = 5) => {
      setLoadingNotifications(true)
      setNotificationsError(null)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (isActive) {
            setNotifications([])
          }
          return
        }

        const { data, error } = await supabase
          .from('notifications')
          .select('id, message, type, date, read')
          .eq('user_id', user.id)
          .eq('read', false)
          .order('date', { ascending: false })
          .limit(limit)

        if (error) {
          throw error
        }

        if (isActive) {
          setNotifications(data ?? [])
        }
      } catch (err) {
        console.error('Failed to load notifications:', err)
        if (isActive) {
          setNotificationsError('Failed to load notifications.')
        }
      } finally {
        if (isActive) {
          setLoadingNotifications(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !isActive) {
        return
      }

      if (notificationsChannel.current) {
        supabase.removeChannel(notificationsChannel.current)
      }

      notificationsChannel.current = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          payload => {
            const newNote = payload.new as NotificationItem
            if (newNote.read) {
              return
            }
            setNotifications(prev => {
              if (prev.some(note => note.id === newNote.id)) {
                return prev
              }
              return [newNote, ...prev].slice(0, 5)
            })
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          payload => {
            const updated = payload.new as { id: string; read: boolean | null }
            if (updated.read) {
              setNotifications(prev =>
                prev.filter(note => note.id !== updated.id)
              )
            }
          }
        )
        .subscribe()
    }

    void setupRealtime()

    return () => {
      isActive = false
      if (notificationsChannel.current) {
        supabase.removeChannel(notificationsChannel.current)
        notificationsChannel.current = null
      }
    }
  }, [])

  const unreadCount = notifications.filter(note => !note.read).length

  return (
    <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative h-9 w-9 border-border bg-background"
        >
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-medium text-foreground">
            Notifications
          </span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {loadingNotifications ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Loading notifications...
            </p>
          ) : notificationsError ? (
            <p className="px-3 py-4 text-sm text-destructive">
              {notificationsError}
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map(note => (
                <li key={note.id} className="px-3 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {note.type ? `${note.type} update` : 'System update'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(note.message ?? 'No details provided.').replace(
                      /^\[feedback:[a-f0-9-]+\]\s*/i,
                      ''
                    )}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {note.date
                      ? new Date(note.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })
                      : 'Date unavailable'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
