'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type AssetDetailsDialogProps = {
  asset: any
  statusLabel: string
}

function formatValue(value?: string | null) {
  if (!value) {
    return 'Not set'
  }
  return value
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not set'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export function AssetDetailsDialog({
  asset,
  statusLabel,
}: AssetDetailsDialogProps) {
  const [open, setOpen] = useState(false)

  const fields = [
    ['Asset ID', asset.asset_no ?? asset.id],
    ['Asset name', asset.asset_name],
    ['Category', asset.asset_categories?.name ?? 'Not set'],
    ['Type', asset.type],
    ['Assigned user', asset.user_name],
    ['Department', asset.department],
    ['Unit', asset.unit],
    ['Purchase date', formatDate(asset.purchase_date)],
    ['Price', asset.price],
    ['Supplier', asset.supplier],
    ['Source', asset.source],
    ['Model', asset.model],
    ['Serial number', asset.serial_no],
    ['Processor', asset.processor],
    ['RAM capacity', asset.ram_capacity],
    ['HDD capacity', asset.hdd_capacity],
    ['Monitor model', asset.monitor_model],
    ['Monitor serial', asset.monitor_serial_no],
    ['Monitor asset', asset.monitor_asset_no],
    ['Keyboard model', asset.keyboard_model],
    ['Keyboard serial', asset.keyboard_serial_no],
    ['Keyboard asset', asset.keyboard_asset_no],
    ['Mouse model', asset.mouse_model],
    ['Mouse serial', asset.mouse_serial_no],
    ['Mouse asset', asset.mouse_asset_no],
    ['QR code', asset.qr_code],
    ['Accessories', asset.accessories],
  ]

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        View Asset Details
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-background shadow-lg">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Asset details</p>
                <h3 className="text-lg font-semibold">
                  {asset.asset_name ?? 'Asset'}
                </h3>
              </div>
              <Badge variant="secondary" className="capitalize">
                {statusLabel}
              </Badge>
            </div>
            <div className="grid gap-4 px-6 py-4 sm:grid-cols-2 text-sm">
              {fields.map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {label}
                  </p>
                  <p className="font-medium text-foreground">
                    {formatValue(String(value ?? ''))}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
