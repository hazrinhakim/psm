import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SonnerNotifier } from '@/components/ui/sonner-notifier'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { generateAssetQr, removeAssetQr } from '@/lib/assetActions'
import { QrCode } from 'lucide-react'
import { QrAssetSelect } from '@/components/assets/QrAssetSelect'
import { QrSearchForm } from '@/components/assets/QrSearchForm'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  QrDeleteConfirmButton,
  QrDownloadButton,
  QrGenerateButton,
  QrPreviewButton,
} from '@/components/assets/QrButtons'

type SearchParams = {
  qr?: string
  removed?: string
  error?: string
  q?: string
  asset?: string
}

type QrAsset = {
  id: string
  asset_no: string | null
  asset_name: string | null
  qr_code: string | null
  user_name: string | null
  department: string | null
  asset_categories?: { name?: string | null } | { name?: string | null }[] | null
}

function qrImageUrl(value: string) {
  const encoded = encodeURIComponent(value)
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}`
}

function qrDownloadUrl(value: string) {
  const encoded = encodeURIComponent(value)
  return `/api/qr?data=${encoded}`
}

function getCategoryName(asset: QrAsset) {
  const category = asset.asset_categories
  if (Array.isArray(category)) {
    return category[0]?.name ?? 'Uncategorized'
  }
  return category?.name ?? 'Uncategorized'
}
export async function QrManagement({
  basePath,
  searchParams,
}: {
  basePath: string
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams)
  let errorMessage: string | null = null
  if (resolvedSearchParams?.error) {
    try {
      errorMessage = decodeURIComponent(resolvedSearchParams.error)
    } catch {
      errorMessage = resolvedSearchParams.error
    }
  }

  const query = (resolvedSearchParams?.q ?? '').trim()
  const hasQuery = Boolean(query)

  const supabase = await createSupabaseServerClient()

  let searchResults: QrAsset[] = []
  if (hasQuery) {
    const { data } = await supabase
      .from('assets')
      .select(
        'id, asset_no, asset_name, qr_code, user_name, department, asset_categories ( name )'
      )
      .or(
        `asset_no.ilike.%${query}%,asset_name.ilike.%${query}%,user_name.ilike.%${query}%`
      )
      .order('asset_name')

    searchResults = (data ?? []) as QrAsset[]
  }

  const { data: assetsWithQr } = await supabase
    .from('assets')
    .select(
      'id, asset_no, asset_name, qr_code, user_name, department, asset_categories ( name )'
    )
    .not('qr_code', 'is', null)
    .order('asset_name')

  const assetsWithQrList = (assetsWithQr ?? []) as QrAsset[]

  let selectedAsset =
    searchResults.find(asset => asset.id === resolvedSearchParams?.asset) ??
    null

  if (!selectedAsset && resolvedSearchParams?.asset) {
    const { data } = await supabase
      .from('assets')
      .select(
        'id, asset_no, asset_name, qr_code, user_name, department, asset_categories ( name )'
      )
      .eq('id', resolvedSearchParams.asset)
      .maybeSingle()

    selectedAsset = (data as QrAsset | null) ?? null
  }

  const showQr = Boolean(resolvedSearchParams?.qr && selectedAsset)
  const selectedCode = selectedAsset
    ? selectedAsset.qr_code ?? selectedAsset.asset_no ?? selectedAsset.id
    : ''
  const selectedName = selectedAsset?.asset_name ?? 'Selected asset'
  const searchOptions = searchResults.map(asset => ({
    ...asset,
    asset_categories: { name: getCategoryName(asset) },
  }))

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          QR Code Management
        </h1>
      </div>

      {(resolvedSearchParams?.qr ||
        resolvedSearchParams?.error ||
        resolvedSearchParams?.removed) && (
        <SonnerNotifier
          title={
            resolvedSearchParams?.error
              ? 'Action needed'
              : resolvedSearchParams?.removed
                ? 'QR code removed'
                : 'QR code updated'
          }
          message={
            resolvedSearchParams?.error
              ? errorMessage || 'Unable to generate QR code.'
              : resolvedSearchParams?.removed
                ? 'QR code cleared for the selected asset.'
                : 'QR code stored for the selected asset.'
          }
          variant={resolvedSearchParams?.error ? 'error' : 'success'}
          toastId={`qr-${
            resolvedSearchParams?.error
              ? 'error'
              : resolvedSearchParams?.removed
                ? 'removed'
                : 'saved'
          }`}
        />
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate QR Code</CardTitle>
            <CardDescription>
              Search for an asset, then generate its QR code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <QrSearchForm basePath={basePath} query={query} />

            <form action={generateAssetQr} className="space-y-3">
              <input type="hidden" name="redirectTo" value={basePath + '/qr'} />
              <input type="hidden" name="q" value={query} />
              <div className="space-y-2">
                <Label htmlFor="asset-select">Select asset</Label>
                <QrAssetSelect
                  id="asset-select"
                  assets={searchOptions}
                  defaultValue={resolvedSearchParams?.asset ?? ''}
                  disabled={!hasQuery || searchResults.length === 0}
                  placeholder={
                    hasQuery ? 'Choose an asset' : 'Search to view assets'
                  }
                />
              </div>
              {hasQuery && searchResults.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No assets found. Try another keyword.
                </p>
              )}
              <QrGenerateButton
                disabled={!hasQuery || searchResults.length === 0}
              />
            </form>

            <div className="rounded-lg border bg-background p-4">
              {showQr ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <Image
                    src={qrImageUrl(selectedCode)}
                    alt={`QR for ${selectedName}`}
                    width={192}
                    height={192}
                    unoptimized
                    className="h-48 w-48 rounded-md border bg-background p-2"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{selectedCode}</p>
                    <p className="text-muted-foreground">
                      {selectedName}
                    </p>
                  </div>
                  <QrDownloadButton
                    href={qrDownloadUrl(selectedCode)}
                    label="Download QR Code"
                    size="default"
                    variant="default"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/40">
                    <QrCode className="h-5 w-5" />
                  </span>
                  <p>Generate a QR code to preview it here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">QR Code Asset Details</CardTitle>
          <CardDescription>
            Review asset info and remove QR codes when needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assetsWithQrList.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {assetsWithQrList.map(asset => {
                const code = asset.qr_code ?? asset.asset_no ?? asset.id

                return (
                  <AccordionItem key={asset.id} value={asset.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex w-full items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
                          <QrCode className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 text-left">
                          <p className="text-sm font-medium truncate">
                            {asset.asset_name || 'Unnamed asset'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {asset.asset_no ?? code}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Asset ID</p>
                          <p className="font-medium">{asset.asset_no ?? code}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Assigned User</p>
                          <p className="font-medium">
                            {asset.user_name || 'Unassigned'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Department</p>
                          <p className="font-medium">
                            {asset.department || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Category</p>
                          <p className="font-medium">
                            {getCategoryName(asset)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">QR Code</p>
                          <p className="font-medium">{code}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <QrPreviewButton
                          imageUrl={qrImageUrl(code)}
                          code={code}
                          assetName={asset.asset_name ?? asset.asset_no ?? 'Selected asset'}
                        />
                        <QrDownloadButton href={qrDownloadUrl(code)} />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Delete QR Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Delete QR code?</DialogTitle>
                              <DialogDescription>
                                This will remove the QR code for{' '}
                                <span className="font-medium">
                                  {asset.asset_name || asset.asset_no || 'this asset'}
                                </span>
                                . You can generate a new one later.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <form action={removeAssetQr}>
                                <input
                                  type="hidden"
                                  name="redirectTo"
                                  value={basePath + '/qr'}
                                />
                                <input type="hidden" name="id" value={asset.id} />
                                <QrDeleteConfirmButton />
                              </form>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          ) : (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No QR codes generated yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
