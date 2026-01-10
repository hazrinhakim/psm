"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

type FeedbackFormProps = {
  role: "staff" | "assistant"
  heading?: string
  description?: string
}

export function FeedbackForm({
  role,
  heading = "Send Feedback",
  description = "Share suggestions or report concerns with the asset team.",
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
    } = await supabase.auth.getUser()

    if (!user) {
      setStatus("Please log in to send feedback.")
      toast.error("Please log in to send feedback.")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("feedback").insert({
      message,
      role,
      created_by: user.id,
      email: user.email ?? null,
    })

    if (error) {
      setStatus(error.message)
      toast.error(error.message)
      setLoading(false)
      return
    }

    setMessage("")
    setStatus("Feedback submitted. Thank you!")
    toast.success("Feedback submitted. Thank you!")
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">{heading}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitFeedback} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Message</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={event => setMessage(event.target.value)}
              className="min-h-[160px]"
              required
            />
          </div>

          {status && (
            <p className="text-sm text-muted-foreground">{status}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading && <Spinner className="mr-2" />}
            {loading ? "Sending..." : "Submit feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
