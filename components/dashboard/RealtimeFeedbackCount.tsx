'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { AnimatedCount } from '@/components/dashboard/AnimatedCount'

type RealtimeFeedbackCountProps = {
  initialCount: number
}

export function RealtimeFeedbackCount({
  initialCount,
}: RealtimeFeedbackCountProps) {
  const [count, setCount] = useState(initialCount)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    let isActive = true

    const loadCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !isActive) {
        return
      }

      const { count: current } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'general')
        .eq('read', false)

      if (isActive && typeof current === 'number') {
        setCount(current)
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      channelRef.current = supabase
        .channel(`feedback-count-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          payload => {
            const note = payload.new as {
              type: string | null
              read: boolean | null
            }
            if (note.type === 'general' && !note.read) {
              setCount(prev => prev + 1)
            }
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
            const note = payload.new as {
              type: string | null
              read: boolean | null
            }
            if (note.type === 'general' && note.read) {
              setCount(prev => Math.max(prev - 1, 0))
            }
          }
        )
        .subscribe()
    }

    void loadCount()

    return () => {
      isActive = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [])

  return <AnimatedCount value={count} />
}
