"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"
import { getUserSafely } from "@/lib/supabaseAuth"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

type FeedbackFormProps = {
  role: 'staff' | 'assistant' | 'admin_assistant'
  heading?: string
}

export function FeedbackForm({
  role,
  heading = "Send Feedback",
}: FeedbackFormProps) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const submitFeedback = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setStatus(null)

    const {
      data: { user },
    } = await getUserSafely()

    if (!user) {
      setStatus("Please log in to send feedback.")
      toast.error("Please log in to send feedback.")
      setLoading(false)
      return
    }

    const { data: feedbackRow, error } = await supabase
      .from('feedback')
      .insert({
        message,
        role,
        created_by: user.id,
        email: user.email ?? null,
      })
      .select('id')
      .single()

    if (error) {
      setStatus(error.message)
      toast.error(error.message)
      setLoading(false)
      return
    }

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'feedback',
          feedbackId: feedbackRow?.id ?? null,
        }),
      })
    } catch (notifyError) {
      console.error("Failed to send notification:", notifyError)
    }

    setMessage("")
    setStatus("Feedback submitted. Thank you!")
    toast.success("Feedback submitted. Thank you!")
    setLoading(false)
  }

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
      </div>

      <div className="w-full max-w-2xl space-y-5">
        <form onSubmit={submitFeedback} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Message</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={event => setMessage(event.target.value)}
              className="min-h-[180px] resize-none"
              placeholder="Share your suggestions, issues, or feature ideas..."
              required
            />
          </div>

          {status && (
            <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {status}
            </div>
          )}

          <div>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Spinner className="mr-1" />}
              {loading ? "Sending..." : "Submit feedback"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
