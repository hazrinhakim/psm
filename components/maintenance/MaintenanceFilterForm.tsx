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
  defaultRequestType: 'all' | 'corrective' | 'preventive'
  defaultUrgency: 'all' | 'due_soon' | 'overdue'
}

export function MaintenanceFilterForm({
  action,
  defaultQuery,
  defaultStatus,
  defaultRequestType,
  defaultUrgency,
}: MaintenanceFilterFormProps) {
  const [status, setStatus] = useState(defaultStatus)
  const [requestType, setRequestType] = useState(defaultRequestType)
  const [urgency, setUrgency] = useState(defaultUrgency)

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
          placeholder="Search by requester, asset or title..."
          defaultValue={defaultQuery}
          className="h-11 pl-11 pr-4"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input type="hidden" name="status" value={status} />
        <input type="hidden" name="requestType" value={requestType} />
        <input type="hidden" name="urgency" value={urgency} />
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

        <Select
          value={requestType}
          onValueChange={value => setRequestType(value as typeof requestType)}
        >
          <SelectTrigger className="h-11 w-full rounded-full sm:w-[12rem]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="corrective">Corrective</SelectItem>
            <SelectItem value="preventive">Preventive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={urgency}
          onValueChange={value => setUrgency(value as typeof urgency)}
        >
          <SelectTrigger className="h-11 w-full rounded-full sm:w-[12rem]">
            <SelectValue placeholder="All Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="due_soon">Due Soon</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button type="submit" className="h-11 w-full gap-2 rounded-full px-8 sm:w-auto">
            <Search className="h-4 w-4" />
            Filter
          </Button>

          <Button asChild variant="outline" className="h-11 w-full rounded-full px-6 sm:w-auto">
            <a href={action}>Clear</a>
          </Button>
        </div>
      </div>
    </form>
  )
}
