'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

type AssetRecord = {
  id: string
  asset_no: string | null
  asset_name: string | null
  type: string | null
  department: string | null
  unit: string | null
  user_name: string | null
  purchase_date: string | null
  qr_code: string | null
  category_id: string | null
  price: string | null
  supplier: string | null
  source: string | null
  model: string | null
  serial_no: string | null
  processor: string | null
  ram_capacity: string | null
  hdd_capacity: string | null
  monitor_model: string | null
  monitor_serial_no: string | null
  monitor_asset_no: string | null
  keyboard_model: string | null
  keyboard_serial_no: string | null
  keyboard_asset_no: string | null
  mouse_model: string | null
  mouse_serial_no: string | null
  mouse_asset_no: string | null
  accessories: string | null
  asset_categories?: {
    name?: string | null
  } | null
}

type AssetScanResultProps = {
  code?: string
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
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

export function AssetScanResult({ code }: AssetScanResultProps) {
  const [asset, setAsset] = useState<AssetRecord | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  const scanPath = useMemo(() => {
    if (!pathname) {
      return '/scan'
    }
    return pathname.replace(/\/result$/, '')
  }, [pathname])

  useEffect(() => {
    const value = code?.trim()
    if (!value) {
      setStatus('No QR code provided.')
      return
    }

    let active = true
    const fetchAsset = async () => {
      setLoading(true)
      setStatus(null)
      setAsset(null)

      const filters = [`asset_no.eq.${value}`, `qr_code.eq.${value}`]
      if (isUuid(value)) {
        filters.push(`id.eq.${value}`)
      }

      const { data, error } = await supabase
        .from('assets')
        .select(
          `
          id,
          asset_no,
          asset_name,
          type,
          department,
          unit,
          user_name,
          purchase_date,
          qr_code,
          category_id,
          price,
          supplier,
          source,
          model,
          serial_no,
          processor,
          ram_capacity,
          hdd_capacity,
          monitor_model,
          monitor_serial_no,
          monitor_asset_no,
          keyboard_model,
          keyboard_serial_no,
          keyboard_asset_no,
          mouse_model,
          mouse_serial_no,
          mouse_asset_no,
          accessories,
          asset_categories ( name )
        `
        )
        .or(filters.join(','))
        .maybeSingle()

      if (!active) {
        return
      }

      if (error) {
        setStatus(error.message)
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (!data) {
        setStatus('No asset matched the provided code.')
        toast.info('No asset matched the provided code.')
        setLoading(false)
        return
      }

      setAsset(data as AssetRecord)
      setLoading(false)
    }

    fetchAsset()

    return () => {
      active = false
    }
  }, [code])

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Asset Scan Result</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing details for the scanned QR code.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={scanPath}>Scan another</Link>
          </Button>
          {code && (
            <p className="text-sm text-muted-foreground self-center">
              Code: {code}
            </p>
          )}
        </CardContent>
      </Card>

      {loading && (
        <Card className="w-full max-w-xl">
          <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Spinner className="h-4 w-4" />
            Loading asset details...
          </CardContent>
        </Card>
      )}

      {status && !loading && (
        <Card className="w-full max-w-xl">
          <CardContent className="py-6 text-sm text-muted-foreground">
            {status}
          </CardContent>
        </Card>
      )}

      {asset && (
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">{asset.asset_name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Asset ID: {asset.asset_no ?? asset.id}
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            {[
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
            ].map(([label, value]) => (
              <div key={label}>
                <span className="font-medium text-foreground">{label}: </span>
                {formatValue(String(value ?? ''))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
