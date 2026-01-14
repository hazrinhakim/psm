import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SonnerNotifier } from '@/components/ui/sonner-notifier'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { generateAssetQr } from '@/lib/assetActions'
import { QrCode, Search } from 'lucide-react'
import { QrAssetSelect } from '@/components/assets/QrAssetSelect'

type SearchParams = {
  qr?: string
  error?: string
  q?: string
  asset?: string
}

function qrImageUrl(value: string) {
  const encoded = encodeURIComponent(value)
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}`
}

function qrDownloadUrl(value: string) {
  const encoded = encodeURIComponent(value)
  return `/api/qr?data=${encoded}`
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

  const supabase = createSupabaseServerClient()

  let searchResults: any[] = []
  if (hasQuery) {
    const { data } = await supabase
      .from('assets')
      .select('id, asset_no, asset_name, qr_code, asset_categories ( name )')
      .or(
        `asset_no.ilike.%${query}%,asset_name.ilike.%${query}%,user_name.ilike.%${query}%`
      )
      .order('asset_name')

    searchResults = data ?? []
  }

  const { data: assetsWithQr } = await supabase
    .from('assets')
    .select('id, asset_no, asset_name, qr_code, asset_categories ( name )')
    .not('qr_code', 'is', null)
    .order('asset_name')

  let selectedAsset =
    searchResults.find(asset => asset.id === resolvedSearchParams?.asset) ??
    null

  if (!selectedAsset && resolvedSearchParams?.asset) {
    const { data } = await supabase
      .from('assets')
      .select('id, asset_no, asset_name, qr_code, asset_categories ( name )')
      .eq('id', resolvedSearchParams.asset)
      .maybeSingle()

    selectedAsset = data ?? null
  }

  const showQr = Boolean(resolvedSearchParams?.qr && selectedAsset)
  const selectedCode = selectedAsset
    ? selectedAsset.qr_code ?? selectedAsset.asset_no ?? selectedAsset.id
    : ''

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">
          QR Code Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Search assets, generate QR codes, and manage downloads.
        </p>
      </div>

      {(resolvedSearchParams?.qr || resolvedSearchParams?.error) && (
        <SonnerNotifier
          title={
            resolvedSearchParams?.error
              ? 'Action needed'
              : 'QR code updated'
          }
          message={
            resolvedSearchParams?.error
              ? errorMessage || 'Unable to generate QR code.'
              : 'QR code stored for the selected asset.'
          }
          variant={resolvedSearchParams?.error ? 'error' : 'success'}
          toastId={`qr-${resolvedSearchParams?.error ? 'error' : 'saved'}`}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate QR Code</CardTitle>
            <CardDescription>
              Search for an asset, then generate its QR code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form method="get" action={basePath + '/qr'} className="space-y-2">
              <Label htmlFor="qr-search">Search asset</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="qr-search"
                    name="q"
                    placeholder="Search by asset no, asset name or user name"
                    defaultValue={query}
                    className="h-11 rounded-full border-muted pl-11 pr-4 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
                  <Button
                    type="submit"
                    className="h-11 w-full rounded-full gap-2 sm:w-auto"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full rounded-full sm:w-auto"
                  >
                    <a href={basePath + '/qr'}>Clear</a>
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Search first to unlock the generate button.
              </p>
            </form>

            <form action={generateAssetQr} className="space-y-3">
              <input type="hidden" name="redirectTo" value={basePath + '/qr'} />
              <input type="hidden" name="q" value={query} />
              <div className="space-y-2">
                <Label htmlFor="asset-select">Select asset</Label>
                <QrAssetSelect
                  id="asset-select"
                  assets={searchResults}
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
              <Button
                type="submit"
                className="w-full"
                disabled={!hasQuery || searchResults.length === 0}
              >
                Generate QR Code
              </Button>
            </form>

            <div className="rounded-lg border bg-muted/20 p-4">
              {showQr ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <img
                    src={qrImageUrl(selectedCode)}
                    alt={`QR for ${selectedAsset.asset_name}`}
                    className="h-48 w-48 rounded-md border bg-white p-2"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{selectedCode}</p>
                    <p className="text-muted-foreground">
                      {selectedAsset.asset_name}
                    </p>
                  </div>
                  <Button asChild>
                    <a
                      href={qrDownloadUrl(selectedCode)}
                    >
                      Download QR Code
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <QrCode className="h-5 w-5" />
                  </span>
                  <p>Generate a QR code to preview it here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assets with QR Codes</CardTitle>
            <CardDescription>
              Ready-to-print QR codes for registered assets.
            </CardDescription>
          </CardHeader>
<CardContent className="space-y-3">
  {assetsWithQr && assetsWithQr.length > 0 ? (
    assetsWithQr.map((asset: any) => {
      const code = asset.qr_code ?? asset.asset_no ?? asset.id

      return (
        <div
          key={asset.id}
          className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
        >
          {/* LEFT CONTENT */}
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <QrCode className="h-5 w-5" />
            </span>

            <div className="min-w-0 text-sm">
              <p
                className="font-medium truncate"
                title={asset.asset_no ?? code}
              >
                {asset.asset_no ?? code}
              </p>
              <p className="truncate text-muted-foreground">
                {asset.asset_name}
              </p>
            </div>
          </div>

          {/* RIGHT BUTTON */}
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a
              href={qrDownloadUrl(code)}
            >
              Download
            </a>
          </Button>
        </div>
      )
    })
  ) : (
    <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
      No QR codes generated yet.
    </div>
  )}
</CardContent>

        </Card>
      </div>
    </div>
  )
}
