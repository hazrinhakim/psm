'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StaffMaintenancePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const submitRequest = async () => {
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
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Submit Maintenance Request</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Describe the issue"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />

        <Button onClick={submitRequest} disabled={loading}>
          Submit
        </Button>
      </CardContent>
    </Card>
  )
}
