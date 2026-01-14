'use client'

import { useMemo, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type Category = {
  id: string
  name: string
}

function formatDateLabel(date?: Date) {
  if (!date) {
    return 'Pick a date'
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function toInputDate(date?: Date) {
  if (!date) {
    return ''
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseInputDate(value?: string | null) {
  if (!value) {
    return undefined
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return date
}

export function AssetCategorySelect({
  id,
  name,
  categories,
  defaultValue,
  placeholder = 'Select category',
}: {
  id: string
  name: string
  categories: Category[]
  defaultValue?: string | null
  placeholder?: string
}) {
  const [value, setValue] = useState(defaultValue ?? 'none')

  return (
    <div>
      <input
        type="hidden"
        name={name}
        value={value === 'none' ? '' : value}
      />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={id} className="h-11 w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Uncategorized</SelectItem>
          {categories.map(category => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function AssetDatePicker({
  id,
  name,
  defaultValue,
  placeholder,
}: {
  id: string
  name: string
  defaultValue?: string | null
  placeholder?: string
}) {
  const initialDate = useMemo(
    () => parseInputDate(defaultValue),
    [defaultValue]
  )
  const [date, setDate] = useState<Date | undefined>(initialDate)

  return (
    <div>
      <input type="hidden" name={name} value={toInputDate(date)} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              'h-11 w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatDateLabel(date) : placeholder ?? 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
