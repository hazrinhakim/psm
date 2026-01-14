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
import { Badge } from '@/components/ui/badge'

type AssetOption = {
  id: string
  asset_no: string | null
  asset_name: string | null
  asset_categories?: {
    name?: string | null
  } | null
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
      <SelectTrigger id={id} className="w-full min-w-0">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            {assets.map(asset => {
              const label = `${asset.asset_no ?? asset.id} - ${
                asset.asset_name ?? 'Untitled asset'
              }`
              const categoryLabel =
                asset.asset_categories?.name ?? 'Uncategorized'
              return (
                <SelectItem key={asset.id} value={asset.id}>
                  <div className="flex w-full min-w-0 items-center justify-between gap-3">
                    <span className="min-w-0 truncate">{label}</span>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {categoryLabel}
                    </Badge>
                  </div>
                </SelectItem>
              )
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  )
}
