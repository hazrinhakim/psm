'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const [serviceOutcome, setServiceOutcome] = useState('completed')
  const [completionChecklist, setCompletionChecklist] = useState({
    checklist_inspection: false,
    checklist_hardware: false,
    checklist_cleaning: false,
    checklist_software: false,
    checklist_testing: false,
  })
  const showCompletionFields =
    progressStep === 'Resolved' || progressStep === 'Completed'

  return (
    <form
      action={updateMaintenanceStatus}
      className="mt-4 space-y-3 text-sm"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="progress_step" value={progressStep} />
      <input type="hidden" name="service_outcome" value={serviceOutcome} />
      {Object.entries(completionChecklist).map(([field, checked]) => (
        <input
          key={field}
          type="hidden"
          name={field}
          value={checked ? 'on' : ''}
        />
      ))}

      <div className="flex flex-wrap items-center gap-2">
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
      </div>

      {showCompletionFields && (
        <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Service completion details
            </p>
            <p className="text-xs text-muted-foreground">
              Record the actual work performed before closing the request.
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`service-outcome-${id}`}>Service outcome</Label>
              <Select
                value={serviceOutcome}
                onValueChange={setServiceOutcome}
              >
                <SelectTrigger id={`service-outcome-${id}`} className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="partially_completed">
                    Partially completed
                  </SelectItem>
                  <SelectItem value="monitoring_required">
                    Monitoring required
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`performed-at-${id}`}>Performed at</Label>
              <Input
                id={`performed-at-${id}`}
                name="performed_at"
                type="datetime-local"
                className="h-10"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`work-summary-${id}`}>Work summary</Label>
              <Textarea
                id={`work-summary-${id}`}
                name="work_summary"
                placeholder="Summarize the service work completed"
                className="min-h-[92px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`downtime-${id}`}>Downtime (hours)</Label>
              <Input
                id={`downtime-${id}`}
                name="estimated_downtime_hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                className="h-10"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-foreground">
              Completion checklist
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['checklist_inspection', 'Initial inspection completed'],
                ['checklist_hardware', 'Hardware components checked'],
                ['checklist_cleaning', 'Device cleaned and serviced'],
                ['checklist_software', 'Software or configuration verified'],
                ['checklist_testing', 'Final testing completed'],
              ].map(([field, label]) => (
                <label
                  key={field}
                  htmlFor={`${field}-${id}`}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2"
                >
                  <Checkbox
                    id={`${field}-${id}`}
                    checked={
                      completionChecklist[
                        field as keyof typeof completionChecklist
                      ]
                    }
                    onCheckedChange={checked =>
                      setCompletionChecklist(prev => ({
                        ...prev,
                        [field]: checked === true,
                      }))
                    }
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <Button type="submit" variant="outline" size="sm" className="rounded-full">
        Update progress
      </Button>
    </form>
  )
}
