'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <span className="text-sm text-slate-500">
        ICT Asset Management System
      </span>

      <Button variant="outline" size="sm" onClick={logout}>
        Logout
      </Button>
    </header>
  )
}
