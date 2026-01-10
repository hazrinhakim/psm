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

export async function QrManagement({
  basePath,
  searchParams,
}: {
  basePath: string
  searchParams?: SearchParams
}) {
  let errorMessage: string | null = null
  if (searchParams?.error) {
    try {
      errorMessage = decodeURIComponent(searchParams.error)
    } catch {
      errorMessage = searchParams.error
    }
  }

  const query = (searchParams?.q ?? '').trim()
  const hasQuery = Boolean(query)

  const supabase = createSupabaseServerClient()

  let searchResults: any[] = []
  if (hasQuery) {
    const { data } = await supabase
      .from('assets')
      .select('id, asset_no, asset_name, qr_code')
      .or(`asset_no.ilike.%${query}%,asset_name.ilike.%${query}%`)
      .order('asset_name')

    searchResults = data ?? []
  }

  const { data: assetsWithQr } = await supabase
    .from('assets')
    .select('id, asset_no, asset_name, qr_code')
    .not('qr_code', 'is', null)
    .order('asset_name')

  let selectedAsset =
    searchResults.find(asset => asset.id === searchParams?.asset) ?? null

  if (!selectedAsset && searchParams?.asset) {
    const { data } = await supabase
      .from('assets')
      .select('id, asset_no, asset_name, qr_code')
      .eq('id', searchParams.asset)
      .maybeSingle()

    selectedAsset = data ?? null
  }

  const showQr = Boolean(searchParams?.qr && selectedAsset)
  const selectedCode = selectedAsset
    ? selectedAsset.qr_code ?? selectedAsset.asset_no ?? selectedAsset.id
    : ''

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          QR Code Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Search assets, generate QR codes, and manage downloads.
        </p>
      </div>

      {(searchParams?.qr || searchParams?.error) && (
        <SonnerNotifier
          title={searchParams?.error ? 'Action needed' : 'QR code updated'}
          message={
            searchParams?.error
              ? errorMessage || 'Unable to generate QR code.'
              : 'QR code stored for the selected asset.'
          }
          variant={searchParams?.error ? 'error' : 'success'}
          toastId={`qr-${searchParams?.error ? 'error' : 'saved'}`}
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
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="qr-search"
                    name="q"
                    placeholder="Search by asset ID or name"
                    defaultValue={query}
                    className="pl-9"
                  />
                </div>
                <Button type="submit" variant="outline" className="shrink-0">
                  Search
                </Button>
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
                  defaultValue={searchParams?.asset ?? ''}
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
                      href={qrImageUrl(selectedCode)}
                      target="_blank"
                      rel="noreferrer"
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
              href={qrImageUrl(code)}
              target="_blank"
              rel="noreferrer"
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
