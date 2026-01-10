import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SonnerNotifier } from '@/components/ui/sonner-notifier'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { createAsset, deleteAsset, updateAsset } from '@/lib/assetActions'
import { normalizeRole } from '@/lib/roles'
import {
  MapPin,
  Calendar,
  User,
  Package,
  Wrench,
  Search,
  Plus,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react'

type SearchParams = {
  saved?: string
  updated?: string
  deleted?: string
  error?: string
  q?: string
}

type AssetStatus = 'active' | 'inactive'

function formatDateInput(value?: string | null) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toISOString().slice(0, 10)
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

function getStatusLabel(status: AssetStatus) {
  return status === 'active' ? 'active' : 'inactive'
}

function getStatusBadge(status: AssetStatus) {
  if (status === 'active') {
    return 'bg-emerald-100 text-emerald-700 border-transparent'
  }
  return 'bg-slate-200 text-slate-600 border-transparent'
}

// Helper function untuk truncate text
function truncateText(text: string, maxLength: number = 15) {
  if (!text) return 'N/A'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Component untuk Asset Detail Dialog
function AssetDetailsDialog({ asset, statusLabel }: { asset: any; statusLabel: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-5xl sm:max-w-5xl max-h-[92vh] overflow-x-hidden">
        <ScrollArea className="max-h-[80vh] pr-4">
          <DialogHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-xl">{asset.asset_name || 'Unnamed Asset'}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">
                    {asset.asset_no || 'N/A'}
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span>{asset.asset_categories?.name || 'Uncategorized'}</span>
                </DialogDescription>
              </div>
              <Badge className={`${statusLabel === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'} border-transparent`}>
                {statusLabel}
              </Badge>
            </div>
          </DialogHeader>

          <div className="grid gap-3 text-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Asset ID</p>
                <p className="font-medium break-words">{asset.asset_no || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium break-words">{asset.type || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Year</p>
                <p className="font-medium break-words">{asset.year || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="font-medium break-words">{asset.model || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Serial No</p>
                <p className="font-medium break-words">{asset.serial_no || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">QR Code</p>
                <p className="font-medium break-words">{asset.qr_code || 'N/A'}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-medium break-words">{asset.department || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Unit</p>
                <p className="font-medium break-words">{asset.unit || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Assigned User</p>
                <p className="font-medium break-words">{asset.user_name || 'Unassigned'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Purchase Date</p>
                <p className="font-medium">{formatDate(asset.purchase_date)}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="font-medium">
                  {asset.price ? `RM ${parseFloat(asset.price).toLocaleString()}` : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Supplier</p>
                <p className="font-medium break-words">{asset.supplier || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="font-medium break-words">{asset.source || 'N/A'}</p>
              </div>
            </div>

            {(asset.processor || asset.ram_capacity || asset.hdd_capacity) && (
              <>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-3">
                  {asset.processor && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Processor</p>
                      <p className="font-medium break-words">{asset.processor}</p>
                    </div>
                  )}
                  {asset.ram_capacity && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">RAM</p>
                      <p className="font-medium break-words">{asset.ram_capacity}</p>
                    </div>
                  )}
                  {asset.hdd_capacity && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Storage</p>
                      <p className="font-medium break-words">{asset.hdd_capacity}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {(asset.monitor_model || asset.keyboard_model || asset.mouse_model) && (
              <>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-3">
                  {asset.monitor_model && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Monitor</p>
                      <p className="font-medium break-words">{asset.monitor_model}</p>
                      {asset.monitor_serial_no && (
                        <p className="text-xs text-muted-foreground break-words">
                          Serial: {asset.monitor_serial_no}
                        </p>
                      )}
                      {asset.monitor_asset_no && (
                        <p className="text-xs text-muted-foreground break-words">
                          Asset No: {asset.monitor_asset_no}
                        </p>
                      )}
                    </div>
                  )}
                  {asset.keyboard_model && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Keyboard</p>
                      <p className="font-medium break-words">{asset.keyboard_model}</p>
                      {asset.keyboard_serial_no && (
                        <p className="text-xs text-muted-foreground break-words">
                          Serial: {asset.keyboard_serial_no}
                        </p>
                      )}
                      {asset.keyboard_asset_no && (
                        <p className="text-xs text-muted-foreground break-words">
                          Asset No: {asset.keyboard_asset_no}
                        </p>
                      )}
                    </div>
                  )}
                  {asset.mouse_model && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Mouse</p>
                      <p className="font-medium break-words">{asset.mouse_model}</p>
                      {asset.mouse_serial_no && (
                        <p className="text-xs text-muted-foreground break-words">
                          Serial: {asset.mouse_serial_no}
                        </p>
                      )}
                      {asset.mouse_asset_no && (
                        <p className="text-xs text-muted-foreground break-words">
                          Asset No: {asset.mouse_asset_no}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {asset.accessories && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Accessories</p>
                  <p className="font-medium break-words">{asset.accessories}</p>
                </div>
              </>
            )}

            <Separator />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created Date</p>
              <p className="font-medium">{formatDate(asset.created_at)}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export async function AssetManagement({
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

  const query = (searchParams?.q ?? '').trim().toLowerCase()

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  const role = normalizeRole(profile?.role)
  const canManage =
    role === 'admin' || role === 'admin_assistant'
  const displayName = profile?.full_name ?? 'Admin User'

  let assetQuery = supabase
    .from('assets')
    .select(
      `
      id,
      asset_no,
      asset_name,
      category_id,
      type,
      qr_code,
      year,
      department,
      unit,
      user_name,
      purchase_date,
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
      created_at,
      asset_categories ( name )
    `
    )
    .order('asset_name')

  if (role === 'staff') {
    const assignee =
      profile?.full_name?.trim() || user?.email || ''
    if (assignee) {
      assetQuery = assetQuery.eq('user_name', assignee)
    } else {
      assetQuery = assetQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  }

  const { data: assets } = await assetQuery

  const { data: categories } = canManage
    ? await supabase
        .from('asset_categories')
        .select('id, name')
        .order('name')
    : { data: [] }

  const shouldGateResults = canManage && !query
  const filteredAssets = shouldGateResults
    ? []
    : query
      ? (assets ?? []).filter((asset: any) => {
          const haystack = [
            asset.asset_no,
            asset.asset_name,
            asset.type,
            asset.department,
            asset.unit,
            asset.user_name,
            asset.asset_categories?.name,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          return haystack.includes(query)
        })
      : assets ?? []

  const totalAssets = assets?.length ?? 0
  const activeAssets = (assets ?? []).filter(
    (asset: any) => asset.user_name && String(asset.user_name).trim()
  ).length

  const { count: maintenanceCount } = await supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['pending', 'in_progress'])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Asset Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {displayName}.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Asset Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Register and manage campus assets.
          </p>
        </div>
        {canManage && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-6xl sm:max-w-6xl max-h-[92vh] overflow-x-hidden">
              <ScrollArea className="max-h-[82vh] pr-4">
                <DialogHeader>
                  <DialogTitle>Register new asset</DialogTitle>
                  <DialogDescription>
                    Add a new asset to the catalog with its basic information.
                  </DialogDescription>
                </DialogHeader>
                <form action={createAsset} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <input type="hidden" name="redirectTo" value={basePath + '/assets'} />
                <div className="space-y-2">
                  <Label htmlFor="asset-no">Asset ID</Label>
                  <Input id="asset-no" name="asset_no" placeholder="AST-1001" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-name">Asset name</Label>
                  <Input id="asset-name" name="asset_name" placeholder="Dell Latitude 5420" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-id">Category</Label>
                  <select
                    id="category-id"
                    name="category_id"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    defaultValue=""
                  >
                    <option value="">Select category</option>
                    {categories?.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-type">Type</Label>
                  <Input id="asset-type" name="type" placeholder="Laptop / Printer / Server" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-qr">QR Code</Label>
                  <Input id="asset-qr" name="qr_code" placeholder="QR-001 (optional)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-year">Year</Label>
                  <Input id="asset-year" name="year" type="number" min="1990" placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-department">Department</Label>
                  <Input id="asset-department" name="department" placeholder="IT Department" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-unit">Unit</Label>
                  <Input id="asset-unit" name="unit" placeholder="Support Unit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-user">Assigned User</Label>
                  <Input id="asset-user" name="user_name" placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">Purchase date</Label>
                  <Input id="purchase-date" name="purchase_date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-price">Price</Label>
                  <Input id="asset-price" name="price" placeholder="3500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-supplier">Supplier</Label>
                  <Input id="asset-supplier" name="supplier" placeholder="Dell Malaysia" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-source">Source</Label>
                  <Input id="asset-source" name="source" placeholder="Purchase / Donation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-model">Model</Label>
                  <Input id="asset-model" name="model" placeholder="Latitude 5420" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-serial">Serial number</Label>
                  <Input id="asset-serial" name="serial_no" placeholder="SN12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-processor">Processor</Label>
                  <Input id="asset-processor" name="processor" placeholder="Intel i5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-ram">RAM capacity</Label>
                  <Input id="asset-ram" name="ram_capacity" placeholder="16 GB" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-hdd">HDD capacity</Label>
                  <Input id="asset-hdd" name="hdd_capacity" placeholder="512 GB SSD" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monitor-model">Monitor model</Label>
                  <Input id="monitor-model" name="monitor_model" placeholder="Dell P2419H" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monitor-serial">Monitor serial no</Label>
                  <Input id="monitor-serial" name="monitor_serial_no" placeholder="MON12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monitor-asset">Monitor asset no</Label>
                  <Input id="monitor-asset" name="monitor_asset_no" placeholder="MON-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyboard-model">Keyboard model</Label>
                  <Input id="keyboard-model" name="keyboard_model" placeholder="Logitech K120" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyboard-serial">Keyboard serial no</Label>
                  <Input id="keyboard-serial" name="keyboard_serial_no" placeholder="KB12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyboard-asset">Keyboard asset no</Label>
                  <Input id="keyboard-asset" name="keyboard_asset_no" placeholder="KB-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mouse-model">Mouse model</Label>
                  <Input id="mouse-model" name="mouse_model" placeholder="Logitech M185" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mouse-serial">Mouse serial no</Label>
                  <Input id="mouse-serial" name="mouse_serial_no" placeholder="MS12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mouse-asset">Mouse asset no</Label>
                  <Input id="mouse-asset" name="mouse_asset_no" placeholder="MS-001" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="asset-accessories">Accessories</Label>
                  <Input id="asset-accessories" name="accessories" placeholder="Docking station, bag" />
                </div>
                <div className="md:col-span-2 pt-4">
                  <Button type="submit" className="w-full sm:w-auto">
                    Save asset
                  </Button>
                </div>
              </form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {(searchParams?.saved ||
        searchParams?.updated ||
        searchParams?.deleted ||
        searchParams?.error) && (
        <SonnerNotifier
          title={
            searchParams?.error
              ? 'Action needed'
              : searchParams?.deleted
                ? 'Asset removed'
                : 'Update saved'
          }
          message={
            searchParams?.error
              ? errorMessage || 'Something went wrong.'
              : searchParams?.deleted
                ? 'Asset removed successfully.'
                : 'Your asset changes have been stored.'
          }
          variant={
            searchParams?.error
              ? 'error'
              : searchParams?.deleted
                ? 'warning'
                : 'success'
          }
          toastId={`asset-${searchParams?.error ? 'error' : searchParams?.deleted ? 'deleted' : 'saved'}`}
        />
      )}

      <Card>
        <CardContent className="pt-6">
          <form method="get" className="flex w-full items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search assets..."
                defaultValue={query}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">
              {totalAssets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-emerald-600">
              {activeAssets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Under Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight text-red-500">
              {maintenanceCount ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAssets.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            {shouldGateResults
              ? 'Search to view assets.'
              : query
                ? 'No assets found. Try another keyword.'
                : 'No assets found yet.'}
          </p>
        )}
        {filteredAssets.map((asset: any) => {
          const status: AssetStatus =
            asset.user_name && String(asset.user_name).trim()
              ? 'active'
              : 'inactive'
          const statusLabel = getStatusLabel(status)
          return (
            <Card key={asset.id} className="overflow-hidden border border-border/60">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate max-w-[100px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]">
                        {truncateText(asset.asset_no ?? asset.id, 20)}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {truncateText(asset.asset_categories?.name ?? 'Uncategorized', 25)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusBadge(status)} flex-shrink-0`}>
                    {statusLabel}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {asset.asset_name ?? 'Asset name'}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">{asset.department ?? 'Department not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">{asset.user_name ?? 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">Purchased: {formatDate(asset.purchase_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">Type: {asset.type ?? 'Not set'}</span>
                </div>

                <div className="pt-3 border-t border-border/60 flex flex-wrap gap-2">
                  <AssetDetailsDialog asset={asset} statusLabel={statusLabel} />
                  {canManage && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-6xl sm:max-w-6xl max-h-[92vh] overflow-x-hidden">
                          <ScrollArea className="max-h-[82vh] pr-4">
                            <DialogHeader>
                              <DialogTitle>Edit Asset</DialogTitle>
                              <DialogDescription>
                                Update asset information.
                              </DialogDescription>
                            </DialogHeader>
                            <form
                              action={updateAsset}
                              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                            >
                              <input type="hidden" name="redirectTo" value={basePath + '/assets'} />
                              <input type="hidden" name="id" value={asset.id} />
                            <div className="space-y-2">
                              <Label htmlFor={`asset-no-${asset.id}`}>Asset ID</Label>
                              <Input
                                id={`asset-no-${asset.id}`}
                                name="asset_no"
                                defaultValue={asset.asset_no ?? ''}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`asset-name-${asset.id}`}>Asset name</Label>
                              <Input
                                id={`asset-name-${asset.id}`}
                                name="asset_name"
                                defaultValue={asset.asset_name ?? ''}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`category-${asset.id}`}>Category</Label>
                              <select
                                id={`category-${asset.id}`}
                                name="category_id"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                defaultValue={asset.category_id ?? ''}
                              >
                                <option value="">Select category</option>
                                {categories?.map((category: any) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`type-${asset.id}`}>Type</Label>
                              <Input
                                id={`type-${asset.id}`}
                                name="type"
                                defaultValue={asset.type ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`qr-${asset.id}`}>QR Code</Label>
                              <Input
                                id={`qr-${asset.id}`}
                                name="qr_code"
                                defaultValue={asset.qr_code ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`year-${asset.id}`}>Year</Label>
                              <Input
                                id={`year-${asset.id}`}
                                name="year"
                                type="number"
                                min="1990"
                                defaultValue={asset.year ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`department-${asset.id}`}>Department</Label>
                              <Input
                                id={`department-${asset.id}`}
                                name="department"
                                defaultValue={asset.department ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`unit-${asset.id}`}>Unit</Label>
                              <Input
                                id={`unit-${asset.id}`}
                                name="unit"
                                defaultValue={asset.unit ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`user-${asset.id}`}>Assigned user</Label>
                              <Input
                                id={`user-${asset.id}`}
                                name="user_name"
                                defaultValue={asset.user_name ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`purchase-${asset.id}`}>Purchase date</Label>
                              <Input
                                id={`purchase-${asset.id}`}
                                name="purchase_date"
                                type="date"
                                defaultValue={formatDateInput(asset.purchase_date)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`price-${asset.id}`}>Price</Label>
                              <Input
                                id={`price-${asset.id}`}
                                name="price"
                                defaultValue={asset.price ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`supplier-${asset.id}`}>Supplier</Label>
                              <Input
                                id={`supplier-${asset.id}`}
                                name="supplier"
                                defaultValue={asset.supplier ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`source-${asset.id}`}>Source</Label>
                              <Input
                                id={`source-${asset.id}`}
                                name="source"
                                defaultValue={asset.source ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`model-${asset.id}`}>Model</Label>
                              <Input
                                id={`model-${asset.id}`}
                                name="model"
                                defaultValue={asset.model ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`serial-${asset.id}`}>Serial number</Label>
                              <Input
                                id={`serial-${asset.id}`}
                                name="serial_no"
                                defaultValue={asset.serial_no ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`processor-${asset.id}`}>Processor</Label>
                              <Input
                                id={`processor-${asset.id}`}
                                name="processor"
                                defaultValue={asset.processor ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`ram-${asset.id}`}>RAM capacity</Label>
                              <Input
                                id={`ram-${asset.id}`}
                                name="ram_capacity"
                                defaultValue={asset.ram_capacity ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`hdd-${asset.id}`}>HDD capacity</Label>
                              <Input
                                id={`hdd-${asset.id}`}
                                name="hdd_capacity"
                                defaultValue={asset.hdd_capacity ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`monitor-model-${asset.id}`}>Monitor model</Label>
                              <Input
                                id={`monitor-model-${asset.id}`}
                                name="monitor_model"
                                defaultValue={asset.monitor_model ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`monitor-serial-${asset.id}`}>Monitor serial no</Label>
                              <Input
                                id={`monitor-serial-${asset.id}`}
                                name="monitor_serial_no"
                                defaultValue={asset.monitor_serial_no ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`monitor-asset-${asset.id}`}>Monitor asset no</Label>
                              <Input
                                id={`monitor-asset-${asset.id}`}
                                name="monitor_asset_no"
                                defaultValue={asset.monitor_asset_no ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`keyboard-model-${asset.id}`}>Keyboard model</Label>
                              <Input
                                id={`keyboard-model-${asset.id}`}
                                name="keyboard_model"
                                defaultValue={asset.keyboard_model ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`keyboard-serial-${asset.id}`}>Keyboard serial no</Label>
                              <Input
                                id={`keyboard-serial-${asset.id}`}
                                name="keyboard_serial_no"
                                defaultValue={asset.keyboard_serial_no ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`keyboard-asset-${asset.id}`}>Keyboard asset no</Label>
                              <Input
                                id={`keyboard-asset-${asset.id}`}
                                name="keyboard_asset_no"
                                defaultValue={asset.keyboard_asset_no ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`mouse-model-${asset.id}`}>Mouse model</Label>
                              <Input
                                id={`mouse-model-${asset.id}`}
                                name="mouse_model"
                                defaultValue={asset.mouse_model ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`mouse-serial-${asset.id}`}>Mouse serial no</Label>
                              <Input
                                id={`mouse-serial-${asset.id}`}
                                name="mouse_serial_no"
                                defaultValue={asset.mouse_serial_no ?? ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`mouse-asset-${asset.id}`}>Mouse asset no</Label>
                              <Input
                                id={`mouse-asset-${asset.id}`}
                                name="mouse_asset_no"
                                defaultValue={asset.mouse_asset_no ?? ''}
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor={`accessories-${asset.id}`}>Accessories</Label>
                              <Input
                                id={`accessories-${asset.id}`}
                                name="accessories"
                                defaultValue={asset.accessories ?? ''}
                              />
                            </div>
                            <div className="md:col-span-2 pt-4">
                              <Button type="submit" className="w-full sm:w-auto">
                                Update asset
                              </Button>
                            </div>
                          </form>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                      
                      <form action={deleteAsset}>
                        <input type="hidden" name="redirectTo" value={basePath + '/assets'} />
                        <input type="hidden" name="id" value={asset.id} />
                        <Button 
                          variant="outline" 
                          className="gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          type="submit"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
