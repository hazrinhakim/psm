"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { normalizeRole, roleToPath } from '@/lib/roles'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

export default function RegisterPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signup' | 'invite'>('signup')
  const [ready, setReady] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [role, setRole] = useState<'admin' | 'admin_assistant' | 'staff'>(
    'staff'
  )

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) {
      setReady(true)
      return
    }

    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) {
      setReady(true)
      return
    }

    setMode('invite')

    const acceptInvite = async () => {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        setError(error.message)
        setReady(true)
        return
      }

      const invitedEmail = data.session?.user?.email ?? ''
      const invitedRole = normalizeRole(
        data.session?.user?.user_metadata?.role
      )
      setEmail(invitedEmail)
      setRole(invitedRole)
      setReady(true)
    }

    acceptInvite()
  }, [])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      toast.success('Account created. Check your email to confirm.')
    }
  }, [success])

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    if (mode === 'invite') {
      const { data: userData, error: userError } = await supabase.auth.updateUser({
        password,
        data: {
          full_name: fullName,
        },
      })

      if (userError) {
        setError(userError.message)
        setLoading(false)
        return
      }

      const userId = userData.user?.id
      if (!userId) {
        setError('User session missing after accepting invite.')
        setLoading(false)
        return
      }

      const { error: profileWriteError } = await supabase
        .from('profiles')
        .upsert(
          { id: userId, full_name: fullName || null, role },
          { onConflict: 'id' }
        )

      if (profileWriteError) {
        setError(profileWriteError.message)
        setLoading(false)
        return
      }

      router.replace(roleToPath(role))
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    if (error) {
      const message = error.message ?? 'Unable to create account.'
      if (message.toLowerCase().includes('already')) {
        setError(
          'This email already has an account. Use the invite link or sign in.'
        )
      } else {
        setError(message)
      }
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Account created, but user record is missing.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: data.user.id,
          full_name: fullName || null,
          role,
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.replace(roleToPath(role))
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <Card className="mx-auto w-full max-w-sm shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Confirm your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to {email}. Follow it to finish
            setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-sm shadow-sm">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl">
          {mode === 'invite' ? 'Complete your invite' : 'Create account'}
        </CardTitle>
        <CardDescription>
          {mode === 'invite'
            ? 'Set a password to activate your account.'
            : 'Get started with asset and maintenance tracking.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={event => setFullName(event.target.value)}
              autoComplete="name"
              required
              disabled={!ready}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              required
              disabled={mode === 'invite'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              disabled={!ready}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              disabled={!ready}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !ready}
          >
            {loading && <Spinner className="mr-2" />}
            {loading
              ? mode === 'invite'
                ? 'Activating account...'
                : 'Creating account...'
              : mode === 'invite'
                ? 'Set password'
                : 'Create account'}
          </Button>

          {mode !== 'invite' && (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-foreground underline">
                Sign in
              </Link>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
