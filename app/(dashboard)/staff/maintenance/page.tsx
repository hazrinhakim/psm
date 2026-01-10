'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

export default function StaffMaintenancePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const submitRequest = async (event?: React.FormEvent) => {
    event?.preventDefault()
    setLoading(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setStatus('Please sign in to submit a request.')
      toast.error('Please sign in to submit a request.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('maintenance_requests').insert({
      title,
      description,
      requested_by: user.id,
      status: 'pending',
    })

    if (error) {
      setStatus(error.message)
      toast.error(error.message)
      setLoading(false)
      return
    }

    setTitle('')
    setDescription('')
    setLoading(false)
    setStatus('Request submitted successfully.')
    toast.success('Request submitted successfully.')
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">
          Submit Maintenance Request
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share issues with the asset team for quicker support.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={submitRequest} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request-title">Title</Label>
            <Input
              id="request-title"
              placeholder="Short summary"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-description">
              Description
            </Label>
            <textarea
              id="request-description"
              placeholder="Describe the issue"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            />
          </div>

          {status && (
            <p className="text-sm text-muted-foreground">{status}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading && <Spinner className="mr-2" />}
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
