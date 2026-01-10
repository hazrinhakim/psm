'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type AssetOption = {
  id: string
  asset_no: string | null
  asset_name: string | null
}

type QrAssetSelectProps = {
  id: string
  assets: AssetOption[]
  defaultValue?: string
  disabled?: boolean
  placeholder: string
}

export function QrAssetSelect({
  id,
  assets,
  defaultValue,
  disabled,
  placeholder,
}: QrAssetSelectProps) {
  const [selected, setSelected] = useState(defaultValue ?? '')

  useEffect(() => {
    setSelected(defaultValue ?? '')
  }, [defaultValue])

  return (
    <>
      <input type="hidden" name="id" value={selected} />
      <Select
        value={selected}
        onValueChange={setSelected}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            {assets.map(asset => {
              const label = `${asset.asset_no ?? asset.id} - ${
                asset.asset_name ?? 'Untitled asset'
              }`
              return (
                <SelectItem key={asset.id} value={asset.id}>
                  {label}
                </SelectItem>
              )
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  )
}
