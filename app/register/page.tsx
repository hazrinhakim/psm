"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import {
  clearInvalidBrowserSession,
  navigateAfterAuthChange,
} from '@/lib/supabaseAuth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { normalizeRole, roleToPath } from '@/lib/roles'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { PasswordInput } from '@/components/ui/password-input'
import { isStrongPassword, passwordPolicyHint } from '@/lib/passwordPolicy'

export default function RegisterPage() {
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
      await clearInvalidBrowserSession()

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

    void acceptInvite()
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

    if (!isStrongPassword(password)) {
      setError(passwordPolicyHint)
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

      await navigateAfterAuthChange(roleToPath(role))
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
      await navigateAfterAuthChange(roleToPath(role))
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <Card className="mx-auto w-full max-w-lg border-border/70">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Registration
          </div>
          <CardTitle className="text-3xl tracking-[-0.03em]">
            Confirm your email
          </CardTitle>
          <CardDescription>
            We sent a confirmation link to {email}. Follow it to finish
            setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <Button asChild className="h-11 w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
        <CardFooter className="border-t border-border/70 pt-5 text-xs text-muted-foreground">
          Check your inbox and spam folder if the email does not appear.
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-lg border-border/70">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {mode === 'invite' ? 'Invitation Setup' : 'Create Account'}
        </div>
        <CardTitle className="text-3xl tracking-[-0.03em]">
          {mode === 'invite' ? 'Complete your invite' : 'Create account'}
        </CardTitle>
        <CardDescription className="mx-auto max-w-md leading-6">
          {mode === 'invite'
            ? 'Set a password to activate your account.'
            : 'Get started with asset and maintenance tracking.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="full-name"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Full name
            </Label>
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
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Email
            </Label>
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

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Password
              </Label>
              <PasswordInput
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                disabled={!ready}
              />
              <p className="text-xs text-muted-foreground">
                {passwordPolicyHint}
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirm-password"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Confirm password
              </Label>
              <PasswordInput
                id="confirm-password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                disabled={!ready}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            className="h-11 w-full"
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
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
