'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StaffMaintenancePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const submitRequest = async (event?: React.FormEvent) => {
    event?.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from('maintenance_requests').insert({
      title,
      description,
      requested_by: user?.id,
    })

    setTitle('')
    setDescription('')
    setLoading(false)
    alert('Request submitted')
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
