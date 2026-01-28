'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

export default function StaffMaintenancePage() {
  const [assets, setAssets] = useState<
    { id: string; asset_no: string | null; asset_name: string | null }[]
  >([])
  const [selectedAssetId, setSelectedAssetId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadAssets = async () => {
      setLoadingAssets(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (isActive) {
          setAssets([])
          setLoadingAssets(false)
        }
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()

      const assignee =
        profile?.full_name?.trim() || user.email || ''

      if (!assignee) {
        if (isActive) {
          setAssets([])
          setLoadingAssets(false)
        }
        return
      }

      const { data } = await supabase
        .from('assets')
        .select('id, asset_no, asset_name')
        .eq('user_name', assignee)
        .order('asset_name')

      if (isActive) {
        setAssets(data ?? [])
        setLoadingAssets(false)
      }
    }

    void loadAssets()

    return () => {
      isActive = false
    }
  }, [])

  const submitRequest = async (event?: React.FormEvent) => {
    event?.preventDefault()
    setLoading(true)
    setStatus(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setStatus('Please sign in to submit a request.')
      toast.error('Please sign in to submit a request.')
      setLoading(false)
      return
    }

    if (!selectedAssetId) {
      setStatus('Please select an asset.')
      toast.error('Please select an asset.')
      setLoading(false)
      return
    }

    const selectedAsset = assets.find(
      asset => asset.id === selectedAssetId
    )
    if (!selectedAsset) {
      setStatus('Selected asset is not available.')
      toast.error('Selected asset is not available.')
      setLoading(false)
      return
    }

    const title = selectedAsset.asset_name
      ? `Maintenance request for ${selectedAsset.asset_name}`
      : selectedAsset.asset_no
        ? `Maintenance request for ${selectedAsset.asset_no}`
        : 'Maintenance request'

    const { data: maintenanceRow, error } = await supabase
      .from('maintenance_requests')
      .insert({
        title,
        asset_id: selectedAssetId,
        description,
        requested_by: user.id,
        status: 'Pending',
      })
      .select('id')
      .single()

    if (error) {
      setStatus(error.message)
      toast.error(error.message)
      setLoading(false)
      return
    }

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'maintenance',
          title,
          maintenanceId: maintenanceRow?.id ?? null,
        }),
      })
    } catch (notifyError) {
      console.error('Failed to send notification:', notifyError)
    }

    setSelectedAssetId('')
    setDescription('')
    setLoading(false)
    setStatus('Request submitted successfully.')
    toast.success('Request submitted successfully.')
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">
          Submit Maintenance Request
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share issues with the asset team for quicker support.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={submitRequest} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-select">Asset</Label>
            <Select
              value={selectedAssetId}
              onValueChange={setSelectedAssetId}
            >
              <SelectTrigger id="asset-select" className="h-11">
                <SelectValue
                  placeholder={
                    loadingAssets
                      ? 'Loading assets...'
                      : assets.length
                        ? 'Select assigned asset'
                        : 'No assigned assets'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assets.map(asset => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.asset_name
                      ? `${asset.asset_name}${asset.asset_no ? ` (${asset.asset_no})` : ''}`
                      : asset.asset_no ?? 'Unnamed asset'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-description">
              Issue description
            </Label>
            <textarea
              id="request-description"
              placeholder="Describe the issue with the selected asset"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            />
          </div>

          {status && (
            <p className="text-sm text-muted-foreground">{status}</p>
          )}

          <Button
            type="submit"
            disabled={loading || loadingAssets || assets.length === 0}
            className="w-full sm:w-auto"
          >
            {loading && <Spinner className="mr-2" />}
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
