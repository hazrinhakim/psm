'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { roleToPath } from '@/lib/roles'
import { navigateAfterAuthChange } from '@/lib/supabaseAuth'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Login failed')
      toast.error('Login failed')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    await navigateAfterAuthChange(roleToPath(profile?.role))
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-5">
      <div className="fixed right-20 top-5 z-30">
        <ModeToggle />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[10%] h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-[8%] right-[10%] h-72 w-72 rounded-full bg-amber-300/15 blur-3xl dark:bg-amber-200/8" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div>
          <Card className="overflow-hidden border-border/70">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-slate-500 to-amber-300" />
            <CardHeader className="space-y-4 pb-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-11 w-32 items-center justify-center rounded-2xl bg-secondary/80 p-2">
                  <Image
                    src="/icamsrbg.png"
                    alt="ICAMS"
                    width={128}
                    height={44}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Secure Login
                </div>
              </div>
              <div className="space-y-2">
                <CardDescription className="max-w-sm text-sm leading-6">
                  Sign in to continue managing ICT assets, maintenance records
                  and internal reports.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="pl-11"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                    {error}
                  </div>
                ) : null}

                <Button type="submit" className="h-11 w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="border-t border-border/70 pt-5">
              <div className="flex w-full items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Integrated Computerized Asset Management System</span>
                <span className="font-medium text-foreground">
                  Negeri Perak Darul Ridzuan
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
