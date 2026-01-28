'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

function parseYear(value?: string | null) {
  if (!value) {
    return undefined
  }
  const year = Number.parseInt(value, 10)
  return Number.isNaN(year) ? undefined : year
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

export function AssetCategoryTypeFields({
  categories,
  categoryId,
  typeName,
  categoryPlaceholder = 'Select category',
  defaultCategoryId,
  defaultType,
  typePlaceholder = 'Auto from category',
}: {
  categories: Category[]
  categoryId: string
  typeName: string
  categoryPlaceholder?: string
  defaultCategoryId?: string | null
  defaultType?: string | null
  typePlaceholder?: string
}) {
  const categoryMap = useMemo(
    () => new Map(categories.map(category => [category.id, category.name])),
    [categories]
  )
  const [categoryValue, setCategoryValue] = useState(
    defaultCategoryId ?? 'none'
  )
  const [typeValue, setTypeValue] = useState(defaultType ?? '')

  const syncType = (nextCategoryId: string) => {
    if (nextCategoryId === 'none') {
      setTypeValue('')
      return
    }
    const label = categoryMap.get(nextCategoryId) ?? ''
    setTypeValue(label)
  }

  useEffect(() => {
    syncType(categoryValue)
  }, [categoryValue, categoryMap])

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={categoryId}>Category</Label>
        <div>
          <input
            type="hidden"
            name="category_id"
            value={categoryValue === 'none' ? '' : categoryValue}
          />
          <Select
            value={categoryValue}
            onValueChange={value => {
              setCategoryValue(value)
              syncType(value)
            }}
          >
            <SelectTrigger id={categoryId} className="h-11 w-full">
              <SelectValue placeholder={categoryPlaceholder} />
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
      </div>
      <div className="space-y-2">
        <Label htmlFor={typeName}>Type</Label>
        <Input
          id={typeName}
          name="type"
          value={typeValue}
          readOnly
          placeholder={typePlaceholder}
          className="h-11"
        />
      </div>
    </>
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

export function AssetYearPicker({
  id,
  name,
  defaultValue,
  placeholder,
  startYear = 1990,
  endYear,
}: {
  id: string
  name: string
  defaultValue?: string | null
  placeholder?: string
  startYear?: number
  endYear?: number
}) {
  const currentYear = new Date().getFullYear()
  const finalEndYear = endYear ?? currentYear
  const initialYear = useMemo(
    () => parseYear(defaultValue),
    [defaultValue]
  )
  const [year, setYear] = useState<number | undefined>(initialYear)
  const years = useMemo(() => {
    const list = []
    for (let y = finalEndYear; y >= startYear; y -= 1) {
      list.push(y)
    }
    return list
  }, [finalEndYear, startYear])

  return (
    <div>
      <input type="hidden" name={name} value={year ? String(year) : ''} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              'h-11 w-full justify-start text-left font-normal',
              !year && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {year ? String(year) : placeholder ?? 'Pick year'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-0" align="start">
          <div className="max-h-64 overflow-y-auto p-2">
            <div className="grid grid-cols-4 gap-2">
              {years.map(item => (
                <Button
                  key={item}
                  type="button"
                  variant={item === year ? 'default' : 'ghost'}
                  className="h-9"
                  onClick={() => setYear(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
