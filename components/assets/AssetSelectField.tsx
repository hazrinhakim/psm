'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AssetSelectField({
  id,
  name,
  placeholder,
  defaultValue,
  options,
}: {
  id: string
  name: string
  placeholder: string
  defaultValue?: string | null
  options: { value: string; label: string }[]
}) {
  const fallbackValue = options[0]?.value ?? ''
  const [value, setValue] = useState(defaultValue ?? fallbackValue)

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={id} className="h-11 w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
