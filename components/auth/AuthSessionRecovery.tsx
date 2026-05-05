'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getSessionSafely } from '@/lib/supabaseAuth'

export function AuthSessionRecovery() {
  useEffect(() => {
    void getSessionSafely().catch(() => {})

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') {
        return
      }

      void getSessionSafely().catch(() => {})
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}
