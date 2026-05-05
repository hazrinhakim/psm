'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type MaintenanceFilterFormProps = {
  action: string
  defaultQuery: string
  defaultStatus: 'all' | 'pending' | 'in_progress' | 'resolved'
}

export function MaintenanceFilterForm({
  action,
  defaultQuery,
  defaultStatus,
}: MaintenanceFilterFormProps) {
  const [status, setStatus] = useState(defaultStatus)

  return (
    <form
      method="get"
      action={action}
      className="flex flex-col gap-3 lg:flex-row lg:items-center"
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          placeholder="Search by requester..."
          defaultValue={defaultQuery}
          className="h-11 pl-11 pr-4"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input type="hidden" name="status" value={status} />
        <Select value={status} onValueChange={value => setStatus(value as typeof status)}>
          <SelectTrigger className="h-11 w-full rounded-full sm:w-[12rem]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button type="submit" className="h-11 gap-2 rounded-full px-8">
            <Search className="h-4 w-4" />
            Filter
          </Button>

          <Button asChild variant="outline" className="h-11 rounded-full px-6">
            <a href={action}>Clear</a>
          </Button>
        </div>
      </div>
    </form>
  )
}
