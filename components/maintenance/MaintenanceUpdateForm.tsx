'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateMaintenanceStatus } from '@/lib/maintenanceActions'

const progressSteps = [
  'Submitted',
  'Received by Admin',
  'Under Review',
  'In Progress',
  'Waiting for Parts',
  'Resolved',
  'Completed',
] as const

type MaintenanceUpdateFormProps = {
  id: string
  redirectTo: string
  defaultProgressStep: (typeof progressSteps)[number]
}

export function MaintenanceUpdateForm({
  id,
  redirectTo,
  defaultProgressStep,
}: MaintenanceUpdateFormProps) {
  const [progressStep, setProgressStep] = useState(defaultProgressStep)

  return (
    <form
      action={updateMaintenanceStatus}
      className="mt-4 flex flex-wrap items-center gap-2 text-sm"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="progress_step" value={progressStep} />

      <Select
        value={progressStep}
        onValueChange={value => setProgressStep(value as typeof progressStep)}
      >
        <SelectTrigger className="h-10 w-full rounded-full sm:w-[14rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {progressSteps.map(step => (
            <SelectItem key={step} value={step}>
              {step}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        name="note"
        placeholder="Add a note (optional)"
        className="min-h-[40px] w-full flex-1 rounded-2xl sm:w-64"
      />

      <Button type="submit" variant="outline" size="sm" className="rounded-full">
        Update progress
      </Button>
    </form>
  )
}
