'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  showCheckbox?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
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
  showCheckbox = false,
  checked = false,
  onCheckedChange,
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

  const roleClass =
    role === 'staff'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/30'
      : 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-200 dark:border-purple-500/30'

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            {showCheckbox ? (
              <Checkbox
                checked={checked}
                onCheckedChange={value => onCheckedChange?.(value === true)}
                aria-label={`Select feedback from ${name}`}
              />
            ) : null}
            <span>
              {name}
              {unreadVisible ? (
                <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-500" />
              ) : null}
            </span>
          </CardTitle>
          <CardDescription>
            <Badge variant="outline" className={roleClass}>
              {role === 'admin_assistant'
                ? 'Admin Assistant'
                : role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>{' '}
            <span className="mx-1 text-muted-foreground">·</span>
            <span>{dateLabel}</span>
          </CardDescription>
        </div>

        <Dialog onOpenChange={open => open && markRead()}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-9">
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
                {email ? <p className="text-muted-foreground">{email}</p> : null}
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
