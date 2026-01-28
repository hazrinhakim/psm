'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type FeedbackItemProps = {
  name: string
  email?: string | null
  role: string
  dateLabel: string
  detailDateLabel: string
  message: string
  isUnread?: boolean
  feedbackId?: string
}

export function FeedbackItem({
  name,
  email,
  role,
  dateLabel,
  detailDateLabel,
  message,
  isUnread = false,
  feedbackId,
}: FeedbackItemProps) {
  const [marked, setMarked] = useState(false)
  const unreadVisible = isUnread && !marked

  const markRead = async () => {
    if (marked || !feedbackId) {
      return
    }
    setMarked(true)
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'feedback', feedbackId }),
      })
    } catch (error) {
      console.error('Failed to mark notifications read:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">
            {name}
            {unreadVisible && (
              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            <Badge
              variant="outline"
              className={
                role === 'staff'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : role === 'admin_assistant'
                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                    : 'bg-purple-100 text-purple-700 border-purple-200'
              }
            >
              {role === 'admin_assistant'
                ? 'Admin Assistant'
                : role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>{' '}
            <span className="mx-1 text-muted-foreground">•</span>
            <span>{dateLabel}</span>
          </CardDescription>
        </div>
        <Dialog onOpenChange={open => open && markRead()}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              View detail
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Feedback detail</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">From</p>
                <p className="text-muted-foreground">{name}</p>
                {email && <p className="text-muted-foreground">{email}</p>}
              </div>
              <div>
                <p className="font-medium text-foreground">Role</p>
                <p className="text-muted-foreground">{role}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Date</p>
                <p className="text-muted-foreground">{detailDateLabel}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Message</p>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {message}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
    </Card>
  )
}
