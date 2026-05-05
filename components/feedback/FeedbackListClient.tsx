'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FeedbackItem } from '@/components/feedback/FeedbackItem'

type FeedbackListItem = {
  id: string
  name: string
  email?: string | null
  role: string
  dateLabel: string
  detailDateLabel: string
  message: string
  isUnread?: boolean
}

type FeedbackListClientProps = {
  items: FeedbackListItem[]
}

export function FeedbackListClient({ items }: FeedbackListClientProps) {
  const [feedbackItems, setFeedbackItems] = useState(items)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const selectedCount = selectedIds.size
  const hasFeedback = feedbackItems.length > 0

  const selectedLabel = useMemo(() => {
    if (!selectedCount) {
      return 'Delete'
    }
    return `Delete (${selectedCount})`
  }, [selectedCount])

  const toggleSelectMode = () => {
    setSelectMode(current => {
      const next = !current
      if (!next) {
        setSelectedIds(new Set())
      }
      return next
    })
  }

  const handleCheckedChange = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const handleDelete = async () => {
    if (!selectedCount) {
      return
    }
    const idsToDelete = Array.from(selectedIds)
    setDeleting(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      })

      if (!response.ok) {
        console.error('Failed to delete feedback:', await response.text())
        return
      }

      setFeedbackItems(prev => {
        const next = prev.filter(item => !idsToDelete.includes(item.id))
        if (!next.length) {
          setSelectMode(false)
        }
        return next
      })
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Failed to delete feedback:', error)
    } finally {
      setDeleting(false)
    }
  }

  if (!hasFeedback) {
    return (
      <p className="text-sm text-muted-foreground">
        No feedback has been submitted yet.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-wrap items-center justify-end gap-2">
        {selectMode && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || selectedCount === 0}
          >
            {deleting ? 'Deleting...' : selectedLabel}
          </Button>
        )}
        <Button variant="outline" onClick={toggleSelectMode}>
          {selectMode ? 'Cancel' : 'Select'}
        </Button>
      </div>

      <div className="grid gap-4">
        {feedbackItems.map(entry => (
          <FeedbackItem
            key={entry.id}
            name={entry.name}
            email={entry.email}
            role={entry.role}
            dateLabel={entry.dateLabel}
            detailDateLabel={entry.detailDateLabel}
            message={entry.message}
            isUnread={entry.isUnread}
            feedbackId={entry.id}
            showCheckbox={selectMode}
            checked={selectedIds.has(entry.id)}
            onCheckedChange={checked => handleCheckedChange(entry.id, checked)}
          />
        ))}
      </div>
    </div>
  )
}
