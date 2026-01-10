'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Status = 'loading' | 'error' | 'success'

export default function AuthConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('Verifying invite link...')

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) {
      setStatus('error')
      setMessage('Invite link is missing token.')
      return
    }

    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) {
      setStatus('error')
      setMessage('Invite link is invalid or expired.')
      return
    }

    const setSession = async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }

      setStatus('success')
      setMessage('Invite verified. Redirecting...')
      router.replace('/auth/set-password')
    }

    setSession()
  }, [router])

  useEffect(() => {
    if (status === 'error') {
      toast.error(message)
      return
    }
    if (status === 'success') {
      toast.success(message)
    }
  }, [message, status])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle>Accept Invite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{message}</p>
          {status === 'error' && (
            <Button asChild variant="outline">
              <Link href="/login">Back to login</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
