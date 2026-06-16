'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'
import { getUserSafely } from '@/lib/supabaseAuth'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

export default function StaffMaintenancePage() {
  const [assets, setAssets] = useState<
    { id: string; asset_no: string | null; asset_name: string | null }[]
  >([])
  const [selectedAssetId, setSelectedAssetId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [requests, setRequests] = useState<
    {
      id: string
      title: string | null
      description: string | null
      status: string | null
      created_at: string | null
      updated_at: string | null
      admin_remark: string | null
    }[]
  >([])
  const [updatesByRequest, setUpdatesByRequest] = useState<
    Record<
      string,
      {
        id: string
        maintenance_request_id: string
        progress_step: string
        note: string | null
        work_summary: string | null
        service_outcome: string | null
        performed_at: string | null
        estimated_downtime_hours: number | null
        checklist_items:
          | { id: string; label: string; checked: boolean }[]
          | null
        created_at: string
      }[]
    >
  >({})

  const requestIdSet = useMemo(
    () => new Set(requests.map((request) => request.id)),
    [requests]
  )

  const formatDateTime = (value?: string | null) => {
    if (!value) return ''
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeClass = (value?: string | null) => {
    const raw = String(value ?? '').toLowerCase()
    if (raw === 'pending') {
      return 'bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 border-rose-200 shadow-sm dark:border-rose-500/30 dark:from-rose-500/15 dark:to-rose-500/5 dark:text-rose-200'
    }
    if (raw === 'in progress' || raw === 'in_progress') {
      return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200 shadow-sm dark:border-blue-500/30 dark:from-blue-500/15 dark:to-blue-500/5 dark:text-blue-200'
    }
    if (raw === 'resolved' || raw === 'completed') {
      return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 shadow-sm dark:border-emerald-500/30 dark:from-emerald-500/15 dark:to-emerald-500/5 dark:text-emerald-200'
    }
    return 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border-slate-200 shadow-sm dark:border-slate-500/30 dark:from-slate-500/15 dark:to-slate-500/5 dark:text-slate-200'
  }

  const loadRequests = useCallback(async (currentUserId: string) => {
    setLoadingRequests(true)

    const { data: requestRows } = await supabase
      .from('maintenance_requests')
      .select(
        'id, title, description, status, created_at, updated_at, admin_remark'
      )
      .eq('requested_by', currentUserId)
      .order('created_at', { ascending: false })

    const nextRequests = (requestRows ?? []).map((row) => ({
      ...row,
      title: row.title ?? 'Maintenance Request',
    }))

    const requestIds = nextRequests.map((row) => row.id)
    let updates: {
      id: string
      maintenance_request_id: string
      progress_step: string
      note: string | null
      work_summary: string | null
      service_outcome: string | null
      performed_at: string | null
      estimated_downtime_hours: number | null
      checklist_items:
        | { id: string; label: string; checked: boolean }[]
        | null
      created_at: string
    }[] = []

    if (requestIds.length > 0) {
      const { data: updateRows } = await supabase
        .from('maintenance_request_updates')
        .select(
          'id, maintenance_request_id, progress_step, note, work_summary, service_outcome, performed_at, estimated_downtime_hours, checklist_items, created_at'
        )
        .in('maintenance_request_id', requestIds)
        .order('created_at', { ascending: true })

      updates = updateRows ?? []
    }

    const groupedUpdates = updates.reduce<Record<string, typeof updates>>(
      (acc, update) => {
        const list = acc[update.maintenance_request_id] ?? []
        list.push(update)
        acc[update.maintenance_request_id] = list
        return acc
      },
      {}
    )

    setRequests(nextRequests)
    setUpdatesByRequest(groupedUpdates)
    setLoadingRequests(false)
  }, [])

  useEffect(() => {
    let isActive = true

    const loadAssets = async () => {
      setLoadingAssets(true)
      const {
        data: { user },
      } = await getUserSafely()

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
  }, [loadRequests])

  useEffect(() => {
    let isMounted = true

    const loadRequesterData = async () => {
      const {
        data: { user },
      } = await getUserSafely()

      if (!user) {
        if (isMounted) {
          setUserId(null)
          setRequests([])
          setUpdatesByRequest({})
          setLoadingRequests(false)
        }
        return
      }

      if (isMounted) {
        setUserId(user.id)
      }

      await loadRequests(user.id)
    }

    void loadRequesterData()

    return () => {
      isMounted = false
    }
  }, [loadRequests])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('maintenance-tracking')
      // Realtime subscription: listen for tracking inserts and request status updates.
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'maintenance_request_updates',
        },
        (payload) => {
          const update = payload.new as {
            id: string
            maintenance_request_id: string
            progress_step: string
            note: string | null
            work_summary: string | null
            service_outcome: string | null
            performed_at: string | null
            estimated_downtime_hours: number | null
            checklist_items:
              | { id: string; label: string; checked: boolean }[]
              | null
            created_at: string
          }

          if (!requestIdSet.has(update.maintenance_request_id)) return

          setUpdatesByRequest((prev) => {
            const list = [...(prev[update.maintenance_request_id] ?? []), update]
            list.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            return { ...prev, [update.maintenance_request_id]: list }
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'maintenance_requests',
        },
        (payload) => {
          const updated = payload.new as {
            id: string
            status: string | null
            updated_at: string | null
            admin_remark: string | null
          }

          if (!requestIdSet.has(updated.id)) return

          setRequests((prev) =>
            prev.map((request) =>
              request.id === updated.id
                ? {
                    ...request,
                    status: updated.status,
                    updated_at: updated.updated_at,
                    admin_remark: updated.admin_remark,
                  }
                : request
            )
          )
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [requestIdSet, userId])

  const submitRequest = async (event?: React.FormEvent) => {
    event?.preventDefault()
    setLoading(true)
    setStatus(null)

    const {
      data: { user },
    } = await getUserSafely()

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

    if (maintenanceRow?.id) {
      const { error: updateError } = await supabase
        .from('maintenance_request_updates')
        .insert({
          maintenance_request_id: maintenanceRow.id,
          progress_step: 'Submitted',
          note: null,
          updated_by: user.id,
        })

      if (updateError) {
        console.error('Failed to create tracking update:', updateError)
      }
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

    await loadRequests(user.id)
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">
            Submit Maintenance Request
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
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
              <Textarea
                id="request-description"
                placeholder="Describe the issue with the selected asset"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="min-h-[140px] rounded-xl"
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

      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">
            Track Your Requests
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Follow every update as your request moves forward.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-5 sm:px-6 sm:pb-6">
          {loadingRequests ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="h-4 w-4" />
              Loading tracking updates...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              No maintenance requests yet.
            </div>
          ) : (
            requests.map((request) => {
              const timeline = updatesByRequest[request.id] ?? []
              const latestUpdate = timeline[timeline.length - 1]

              return (
                <div
                  key={request.id}
                  className="rounded-xl border p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {request.title ?? 'Maintenance Request'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {formatDateTime(request.created_at)}
                      </p>
                    </div>
                    <Badge className={`${getStatusBadgeClass(request.status)} capitalize`}>
                      {request.status ?? 'Pending'}
                    </Badge>
                  </div>

                  {latestUpdate && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Latest update: {latestUpdate.progress_step}
                    </p>
                  )}

                  <div className="mt-4 space-y-4">
                    {/* Timeline rendering logic */}
                    {timeline.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Tracking updates will appear here once the admin reviews your request.
                      </p>
                    ) : (
                      timeline.map((update, index) => (
                        <div
                          key={update.id}
                          className="relative flex gap-3"
                        >
                          <div className="relative flex w-4 shrink-0 justify-center">
                            {index < timeline.length - 1 && (
                              <div className="absolute left-1/2 top-2.5 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-blue-200 via-border to-border dark:from-blue-400/60 dark:via-border dark:to-border" />
                            )}
                            <div className="relative z-10 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12),0_0_18px_rgba(59,130,246,0.24)] dark:bg-blue-400 dark:shadow-[0_0_0_4px_rgba(96,165,250,0.16),0_0_18px_rgba(96,165,250,0.28)]" />
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-medium">
                              {update.progress_step}
                            </p>
                            {update.note && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {update.note}
                              </p>
                            )}
                            {update.work_summary && (
                              <p className="mt-2 text-sm text-foreground">
                                {update.work_summary}
                              </p>
                            )}
                            {(update.service_outcome ||
                              update.estimated_downtime_hours !== null) && (
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {update.service_outcome && (
                                  <span className="rounded-full border border-border/70 bg-background px-2.5 py-1">
                                    Outcome:{' '}
                                    {update.service_outcome.replace(/_/g, ' ')}
                                  </span>
                                )}
                                {update.estimated_downtime_hours !== null && (
                                  <span className="rounded-full border border-border/70 bg-background px-2.5 py-1">
                                    Downtime: {update.estimated_downtime_hours} hour(s)
                                  </span>
                                )}
                              </div>
                            )}
                            {update.checklist_items &&
                              update.checklist_items.length > 0 && (
                                <div className="mt-2 space-y-1 rounded-xl border border-border/70 bg-background/80 px-3 py-2">
                                  <p className="text-xs font-medium text-foreground">
                                    Completion checklist
                                  </p>
                                  <ul className="space-y-1 text-xs text-muted-foreground">
                                    {update.checklist_items
                                      .filter(item => item.checked)
                                      .map(item => (
                                        <li key={item.id}>• {item.label}</li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDateTime(update.performed_at ?? update.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
