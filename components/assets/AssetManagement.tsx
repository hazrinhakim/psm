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
import { AssetCreateSubmitButton } from '@/components/assets/AssetCreateSubmitButton'
import { AssetDeleteButton } from '@/components/assets/AssetDeleteButton'
import { AssetSearchForm } from '@/components/assets/AssetSearchForm'
import { CopyButton } from '@/components/assets/CopyButton'
import { AnimatedCount } from '@/components/assets/AnimatedCount'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AssetCategoryTypeFields,
  AssetDatePicker,
  AssetYearPicker,
} from '@/components/assets/AssetFormControls'
import {
  MapPin,
  Calendar,
  User,
  Package,
  Plus,
  Pencil,
  FileText,
  Laptop,
  Printer,
  Monitor,
  Cpu,
} from 'lucide-react'

type SearchParams = {
  saved?: string
  updated?: string
  deleted?: string
  error?: string
  q?: string
}

type AssetStatus = 'active' | 'inactive'

type AssetCategory = {
  name?: string | null
}

type Asset = {
  id: string
  asset_no?: string | null
  asset_name?: string | null
  category_id?: string | null
  type?: string | null
  qr_code?: string | null
  year?: string | number | null
  department?: string | null
  unit?: string | null
  user_name?: string | null
  purchase_date?: string | null
  price?: string | number | null
  supplier?: string | null
  source?: string | null
  model?: string | null
  serial_no?: string | null
  processor?: string | null
  ram_capacity?: string | null
  hdd_capacity?: string | null
  monitor_model?: string | null
  monitor_serial_no?: string | null
  monitor_asset_no?: string | null
  keyboard_model?: string | null
  keyboard_serial_no?: string | null
  keyboard_asset_no?: string | null
  mouse_model?: string | null
  mouse_serial_no?: string | null
  mouse_asset_no?: string | null
  accessories?: string | null
  created_at?: string | null
  asset_categories?: AssetCategory | AssetCategory[] | null
}

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

// Badge classes dengan gradient dan animation
function getStatusBadge(status: AssetStatus) {
  if (status === 'active') {
    return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 shadow-sm dark:border-emerald-500/30 dark:from-emerald-500/15 dark:to-emerald-500/5 dark:text-emerald-200'
  }
  return 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border-slate-200 shadow-sm dark:border-slate-500/30 dark:from-slate-500/15 dark:to-slate-500/5 dark:text-slate-200'
}

// Helper function untuk truncate text
function truncateText(text: string, maxLength: number = 15) {
  if (!text) return 'N/A'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function getCategoryName(asset: Asset) {
  const category = asset.asset_categories
  if (Array.isArray(category)) {
    return category[0]?.name ?? 'Uncategorized'
  }
  return category?.name ?? 'Uncategorized'
}

// Component untuk Asset Detail Dialog dengan design premium
function AssetDetailsDialog({ asset, statusLabel }: { asset: Asset; statusLabel: string }) {
  // Tentukan icon berdasarkan jenis asset
  const getAssetIcon = () => {
    const type = asset.type?.toLowerCase() || ''
    if (type.includes('laptop')) return Laptop
    if (type.includes('computer') || type.includes('desktop')) return Monitor
    if (type.includes('printer')) return Printer
    return Package
  }

  const AssetIcon = getAssetIcon()
  
  const iconBg = statusLabel === 'active' 
    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
    : 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300'
  const accentColor =
    statusLabel === 'active'
      ? 'from-emerald-400/30 to-emerald-200/0 dark:from-emerald-400/20 dark:to-emerald-500/0'
      : 'from-slate-400/25 to-slate-200/0 dark:from-slate-300/18 dark:to-slate-500/0'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="h-9 gap-2"
        >
          <FileText className="h-4 w-4" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-5xl overflow-x-hidden border-border bg-background sm:max-w-5xl">
        <ScrollArea className="max-h-[80vh] pr-4">
          <DialogHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                  <AssetIcon className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-foreground">
                    {asset.asset_name || 'Unnamed Asset'}
                  </DialogTitle>
                  <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-medium text-muted-foreground">
                      {asset.asset_no || 'N/A'}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span>{getCategoryName(asset)}</span>
                  </DialogDescription>
                </div>
              </div>
              <Badge className={`${getStatusBadge(statusLabel === 'active' ? 'active' : 'inactive')} font-medium px-3 py-1`}>
                {statusLabel}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            <div className="rounded-[1.25rem] border border-border/70 bg-muted/20 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Overview
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Asset ID</p>
                  <p className="break-words font-medium text-foreground">{asset.asset_no || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="break-words font-medium text-foreground">{asset.type || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Year</p>
                  <p className="break-words font-medium text-foreground">{asset.year || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Model</p>
                  <p className="break-words font-medium text-foreground">{asset.model || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Serial No</p>
                  <p className="break-words font-medium text-foreground">{asset.serial_no || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">QR Code</p>
                  <p className="break-words font-medium text-foreground">{asset.qr_code || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Ownership Card */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/60 to-background p-5 transition-all duration-300 hover:shadow-md">
              <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                Ownership & Purchase
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="break-words font-medium text-foreground">{asset.department || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Unit</p>
                  <p className="break-words font-medium text-foreground">{asset.unit || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Assigned User</p>
                  <p className="break-words font-medium text-foreground">{asset.user_name || 'Unassigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Purchase Date</p>
                  <p className="font-medium text-foreground">{formatDate(asset.purchase_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-medium text-foreground">
                    {asset.price !== null && asset.price !== undefined && asset.price !== ''
                      ? `RM ${Number(asset.price).toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Supplier</p>
                  <p className="break-words font-medium text-foreground">{asset.supplier || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="break-words font-medium text-foreground">{asset.source || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Specifications Card */}
            {(asset.processor || asset.ram_capacity || asset.hdd_capacity) && (
              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/60 to-background p-5 transition-all duration-300 hover:shadow-md">
                <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  Device Specifications
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {asset.processor && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Processor</p>
                      <p className="break-words font-medium text-foreground">{asset.processor}</p>
                    </div>
                  )}
                  {asset.ram_capacity && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">RAM</p>
                      <p className="break-words font-medium text-foreground">{asset.ram_capacity}</p>
                    </div>
                  )}
                  {asset.hdd_capacity && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Storage</p>
                      <p className="break-words font-medium text-foreground">{asset.hdd_capacity}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Peripherals Card */}
            {(asset.monitor_model || asset.keyboard_model || asset.mouse_model) && (
              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/60 to-background p-5 transition-all duration-300 hover:shadow-md">
                <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  Peripherals
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {asset.monitor_model && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Monitor</p>
                      <p className="break-words font-medium text-foreground">{asset.monitor_model}</p>
                      {asset.monitor_serial_no && (
                        <p className="text-xs text-muted-foreground break-words">
                          Serial: {asset.monitor_serial_no}
                        </p>
                      )}
                    </div>
                  )}
                  {asset.keyboard_model && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Keyboard</p>
                      <p className="break-words font-medium text-foreground">{asset.keyboard_model}</p>
                      {asset.keyboard_serial_no && (
                        <p className="text-xs text-muted-foreground break-words">
                          Serial: {asset.keyboard_serial_no}
                        </p>
                      )}
                    </div>
                  )}
                  {asset.mouse_model && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Mouse</p>
                      <p className="break-words font-medium text-foreground">{asset.mouse_model}</p>
                      {asset.mouse_serial_no && (
                        <p className="text-xs text-muted-foreground break-words">
                          Serial: {asset.mouse_serial_no}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes Card */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/60 to-background p-5 transition-all duration-300 hover:shadow-md">
              <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                Notes
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Accessories</p>
                  <p className="break-words font-medium text-foreground">
                    {asset.accessories || 'None'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Created Date</p>
                  <p className="font-medium text-foreground">{formatDate(asset.created_at)}</p>
                </div>
              </div>
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
    if (errorMessage === 'assignee_not_found') {
      errorMessage = 'Assigned user must match a signed-in profile.'
    }
  }

  const query = (searchParams?.q ?? '').trim().toLowerCase()

  const supabase = await createSupabaseServerClient()
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
  const assetsList = (assets ?? []) as Asset[]

  const { data: categories } = canManage
    ? await supabase
        .from('asset_categories')
        .select('id, name')
        .order('name')
    : { data: [] }

  const { data: assignees } = canManage
    ? await supabase
        .from('profiles')
        .select('full_name')
        .not('full_name', 'is', null)
    : { data: [] }

  const assigneeNames = Array.from(
    new Set((assignees ?? []).map(entry => entry.full_name).filter(Boolean))
  )

  const shouldGateResults = canManage && !query
  const filteredAssets = shouldGateResults
    ? []
    : query
      ? assetsList.filter(asset => {
          const haystack = [
            asset.asset_no,
            asset.asset_name,
            asset.type,
            asset.department,
            asset.unit,
            asset.user_name,
            getCategoryName(asset),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          return haystack.includes(query)
        })
      : assetsList

  const assetTypeSummaries = [
    { label: 'Computer', icon: Monitor, color: 'from-blue-400 to-blue-300' },
    { label: 'Laptop', icon: Laptop, color: 'from-emerald-400 to-emerald-300' },
    { label: 'Printer', icon: Printer, color: 'from-amber-400 to-amber-300' },
  ].map(({ label, icon, color }) => {
    const matches = assetsList.filter(asset => {
      const type = String(asset.type ?? '').trim().toLowerCase()
      return type === label.toLowerCase()
    })
    return {
      label,
      icon,
      color,
      count: matches.length,
    }
  })

  return (
    <div className="space-y-6 p-1">
      {assigneeNames.length > 0 && (
        <datalist id="assignee-list">
          {assigneeNames.map(name => (
            <option key={name} value={name} />
          ))}
        </datalist>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Asset Management
          </h2>
        </div>
        {canManage && (
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-10 gap-2 px-6">
                  <Plus className="h-4 w-4" />
                  Add Asset
                </Button>
              </DialogTrigger>
                <DialogContent className="max-h-[92vh] w-[95vw] max-w-6xl overflow-x-hidden border border-border bg-background shadow-2xl sm:max-w-6xl">
                  <ScrollArea className="max-h-[82vh] pr-4">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-foreground">
                        Register New Asset
                      </DialogTitle>
                      <DialogDescription>
                        Add a new asset to the catalog with its basic information.
                      </DialogDescription>
                    </DialogHeader>
                    <form action={createAsset} className="space-y-6">
                      <input type="hidden" name="redirectTo" value={basePath + '/assets'} />
                      
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">
                          Basic Information
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="asset-no">Asset ID</Label>
                            <Input 
                              id="asset-no" 
                              name="asset_no" 
                              placeholder="AST-1001" 
                              className="h-11" 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-name">Asset Name</Label>
                            <Input 
                              id="asset-name" 
                              name="asset_name" 
                              placeholder="Dell Latitude 5420" 
                              className="h-11" 
                              required 
                            />
                          </div>
                          <AssetCategoryTypeFields
                            categories={categories ?? []}
                            categoryId="category-id"
                            typeName="asset-type"
                          />
                          <div className="space-y-2">
                            <Label htmlFor="asset-qr">QR Code</Label>
                            <Input 
                              id="asset-qr" 
                              name="qr_code" 
                              placeholder="QR-001 (optional)" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-year">Year</Label>
                            <AssetYearPicker
                              id="asset-year"
                              name="year"
                              placeholder="Pick year"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-border" />

                      <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                          Ownership & Purchase
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="asset-department">Department</Label>
                            <Input 
                              id="asset-department" 
                              name="department" 
                              placeholder="IT Department" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-unit">Unit</Label>
                            <Input 
                              id="asset-unit" 
                              name="unit" 
                              placeholder="Support Unit" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-user">Assigned User</Label>
                            <Input
                              id="asset-user"
                              name="user_name"
                              placeholder="Search signed-in user"
                              list={assigneeNames.length ? 'assignee-list' : undefined}
                              className="h-11" 
                            />
                            <p className="text-xs text-muted-foreground">
                              Must match a signed-in user profile.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="purchase-date">Purchase Date</Label>
                            <AssetDatePicker
                              id="purchase-date"
                              name="purchase_date"
                              placeholder="Pick purchase date"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-price">Price (RM)</Label>
                            <Input 
                              id="asset-price" 
                              name="price" 
                              placeholder="3500" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-supplier">Supplier</Label>
                            <Input 
                              id="asset-supplier" 
                              name="supplier" 
                              placeholder="Dell Malaysia" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-source">Source</Label>
                            <Input 
                              id="asset-source" 
                              name="source" 
                              placeholder="Purchase / Donation" 
                              className="h-11" 
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-border" />

                      <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                          Device Specifications
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="asset-model">Model</Label>
                            <Input 
                              id="asset-model" 
                              name="model" 
                              placeholder="Latitude 5420" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-serial">Serial Number</Label>
                            <Input 
                              id="asset-serial" 
                              name="serial_no" 
                              placeholder="SN12345" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-processor">Processor</Label>
                            <Input 
                              id="asset-processor" 
                              name="processor" 
                              placeholder="Intel i5" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-ram">RAM Capacity</Label>
                            <Input 
                              id="asset-ram" 
                              name="ram_capacity" 
                              placeholder="16 GB" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-hdd">Storage Capacity</Label>
                            <Input 
                              id="asset-hdd" 
                              name="hdd_capacity" 
                              placeholder="512 GB SSD" 
                              className="h-11" 
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-border" />

                      <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Package className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                          Peripherals
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="monitor-model">Monitor Model</Label>
                            <Input 
                              id="monitor-model" 
                              name="monitor_model" 
                              placeholder="Dell P2419H" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monitor-serial">Monitor Serial No</Label>
                            <Input 
                              id="monitor-serial" 
                              name="monitor_serial_no" 
                              placeholder="MON12345" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monitor-asset">Monitor Asset No</Label>
                            <Input 
                              id="monitor-asset" 
                              name="monitor_asset_no" 
                              placeholder="MON-001" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="keyboard-model">Keyboard Model</Label>
                            <Input 
                              id="keyboard-model" 
                              name="keyboard_model" 
                              placeholder="Logitech K120" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="keyboard-serial">Keyboard Serial No</Label>
                            <Input 
                              id="keyboard-serial" 
                              name="keyboard_serial_no" 
                              placeholder="KB12345" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="keyboard-asset">Keyboard Asset No</Label>
                            <Input 
                              id="keyboard-asset" 
                              name="keyboard_asset_no" 
                              placeholder="KB-001" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mouse-model">Mouse Model</Label>
                            <Input 
                              id="mouse-model" 
                              name="mouse_model" 
                              placeholder="Logitech M185" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mouse-serial">Mouse Serial No</Label>
                            <Input 
                              id="mouse-serial" 
                              name="mouse_serial_no" 
                              placeholder="MS12345" 
                              className="h-11" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mouse-asset">Mouse Asset No</Label>
                            <Input 
                              id="mouse-asset" 
                              name="mouse_asset_no" 
                              placeholder="MS-001" 
                              className="h-11" 
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-border" />

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="space-y-2 md:col-span-2 xl:col-span-3">
                          <Label htmlFor="asset-accessories">Accessories</Label>
                          <Input 
                            id="asset-accessories" 
                            name="accessories" 
                            placeholder="Docking station, bag" 
                            className="h-11" 
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <AssetCreateSubmitButton />
                        </div>
                    </form>
                  </ScrollArea>
                </DialogContent>
              
            </Dialog>
          </div>
        )}
      </div>

      {/* Notification - with premium styling */}
      {(searchParams?.saved ||
        searchParams?.updated ||
        searchParams?.deleted ||
        searchParams?.error) && (
        <div>
          <SonnerNotifier
            title={
              searchParams?.error
                ? '⚠️ Action needed'
                : searchParams?.deleted
                  ? '👋 Asset removed'
                  : '✅ Update saved'
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
        </div>
      )}

      {/* Asset Type Value Cards - with premium design from AdminDashboard */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assetTypeSummaries.map((summary, index) => {
          const Icon = summary.icon
          const accentStyles = {
            Computer:
              'border border-blue-200/70 bg-blue-100/55 text-blue-600 dark:border-blue-500/15 dark:bg-blue-500/12 dark:text-blue-300',
            Laptop:
              'border border-emerald-200/70 bg-emerald-100/50 text-emerald-600 dark:border-emerald-500/15 dark:bg-emerald-500/12 dark:text-emerald-300',
            Printer:
              'border border-amber-200/70 bg-amber-100/50 text-amber-600 dark:border-amber-500/15 dark:bg-amber-500/12 dark:text-amber-300',
          }
          const accentStyle =
            accentStyles[summary.label as keyof typeof accentStyles] ||
            'border border-border bg-muted/50 text-muted-foreground'

          return (
            <Card 
              key={summary.label} 
              className="border-border/70 shadow-none"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-semibold tracking-tight text-foreground">
                      <AnimatedCount value={summary.count} />
                    </div>

                    <p className="mt-2 text-sm font-medium text-foreground">
                      {summary.label}s
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      Total assets
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentStyle}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search Field - with premium styling */}
      <AssetSearchForm basePath={basePath} query={query} />

      {/* Assets Grid - with premium card design */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAssets.length === 0 && (
          <div className="col-span-full h-80 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                {shouldGateResults
                  ? 'Search to view assets'
                  : query
                    ? 'No assets found'
                    : 'No assets yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
                {shouldGateResults
                  ? 'Enter a search term to find assets'
                  : query
                    ? 'Try adjusting your search keywords'
                    : 'Get started by adding your first asset'}
              </p>
            </div>
          </div>
        )}
        
        {filteredAssets.map((asset: Asset, index: number) => {
          const status: AssetStatus =
            asset.user_name && String(asset.user_name).trim()
              ? 'active'
              : 'inactive'
          const statusLabel = getStatusLabel(status)
          
          const iconBg = status === 'active'
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
            : 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300'

          // Choose icon based on asset type
          const getAssetIcon = () => {
            const type = asset.type?.toLowerCase() || ''
            if (type.includes('laptop')) return Laptop
            if (type.includes('computer') || type.includes('desktop')) return Monitor
            if (type.includes('printer')) return Printer
            return Package
          }
          const AssetIcon = getAssetIcon()
          
          return (
            <Card 
              key={asset.id} 
              className="border-border/70 shadow-none"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="space-y-4 bg-muted/20">
              
                <div className="flex items-start justify-between gap-3 grid grid-cols-5">

                  <div className="flex items-start gap-3 min-w-0 flex-1 col-span-4">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                      <AssetIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 group/title">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CardTitle className="truncate cursor-default text-base font-semibold text-foreground">
                                {truncateText(asset.asset_no ?? asset.id)}
                              </CardTitle>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-sm font-medium">{asset.asset_no ?? asset.id}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <CopyButton text={asset.asset_no ?? asset.id} />
                      </div>
                      <CardDescription className="truncate text-xs">
                        {truncateText(getCategoryName(asset))}
                      </CardDescription>
                    </div>
                  </div>

                  <Badge className={`${getStatusBadge(status)} flex-shrink-0 text-xs px-2 py-0 col-span-1`}>
                    {statusLabel}
                  </Badge>
                </div>

                <div>
                  <p className="line-clamp-2 text-sm font-semibold text-foreground">
                    {asset.asset_name ?? 'Asset name'}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-foreground">{asset.department ?? 'Department not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-foreground">{asset.user_name ?? 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-foreground">Purchased: {formatDate(asset.purchase_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-foreground">
                    Category: {getCategoryName(asset)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <AssetDetailsDialog asset={asset} statusLabel={statusLabel} />
                  
                  {canManage && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="h-9 gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[92vh] w-[95vw] max-w-6xl overflow-x-hidden border-border bg-background sm:max-w-6xl">
                          <ScrollArea className="max-h-[82vh] pr-4">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-foreground">
                                Edit Asset
                              </DialogTitle>
                              <DialogDescription>
                                Update asset information.
                              </DialogDescription>
                            </DialogHeader>
                            <form action={updateAsset} className="space-y-6">
                              <input type="hidden" name="redirectTo" value={basePath + '/assets'} />
                              <input type="hidden" name="id" value={asset.id} />
                              
                              <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                  Basic Information
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`asset-no-${asset.id}`}>Asset ID</Label>
                                    <Input
                                      id={`asset-no-${asset.id}`}
                                      name="asset_no"
                                      defaultValue={asset.asset_no ?? ''}
                                      className="h-11"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`asset-name-${asset.id}`}>Asset Name</Label>
                                    <Input
                                      id={`asset-name-${asset.id}`}
                                      name="asset_name"
                                      defaultValue={asset.asset_name ?? ''}
                                      className="h-11"
                                      required
                                    />
                                  </div>
                                  <AssetCategoryTypeFields
                                    categories={categories ?? []}
                                    categoryId={`category-${asset.id}`}
                                    typeName={`type-${asset.id}`}
                                    defaultCategoryId={asset.category_id ?? ''}
                                    defaultType={asset.type ?? ''}
                                  />
                                  <div className="space-y-2">
                                    <Label htmlFor={`qr-${asset.id}`}>QR Code</Label>
                                    <Input
                                      id={`qr-${asset.id}`}
                                      name="qr_code"
                                      defaultValue={asset.qr_code ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`year-${asset.id}`}>Year</Label>
                                    <AssetYearPicker
                                      id={`year-${asset.id}`}
                                      name="year"
                                      defaultValue={
                                        asset.year !== null && asset.year !== undefined
                                          ? String(asset.year)
                                          : ''
                                      }
                                      placeholder="Pick year"
                                    />
                                  </div>
                                </div>
                              </div>

                              <Separator className="bg-border" />

                              <div className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                  <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                  Ownership & Purchase
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`department-${asset.id}`}>Department</Label>
                                    <Input
                                      id={`department-${asset.id}`}
                                      name="department"
                                      defaultValue={asset.department ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`unit-${asset.id}`}>Unit</Label>
                                    <Input
                                      id={`unit-${asset.id}`}
                                      name="unit"
                                      defaultValue={asset.unit ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`user-${asset.id}`}>Assigned User</Label>
                                    <Input
                                      id={`user-${asset.id}`}
                                      name="user_name"
                                      defaultValue={asset.user_name ?? ''}
                                      list={assigneeNames.length ? 'assignee-list' : undefined}
                                      className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Must match a signed-in user profile.
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`purchase-${asset.id}`}>Purchase Date</Label>
                                    <AssetDatePicker
                                      id={`purchase-${asset.id}`}
                                      name="purchase_date"
                                      defaultValue={formatDateInput(asset.purchase_date)}
                                      placeholder="Pick purchase date"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`price-${asset.id}`}>Price (RM)</Label>
                                    <Input
                                      id={`price-${asset.id}`}
                                      name="price"
                                      defaultValue={asset.price ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`supplier-${asset.id}`}>Supplier</Label>
                                    <Input
                                      id={`supplier-${asset.id}`}
                                      name="supplier"
                                      defaultValue={asset.supplier ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`source-${asset.id}`}>Source</Label>
                                    <Input
                                      id={`source-${asset.id}`}
                                      name="source"
                                      defaultValue={asset.source ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                </div>
                              </div>

                              <Separator className="bg-border" />

                              <div className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                  <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                  Device Specifications
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`model-${asset.id}`}>Model</Label>
                                    <Input
                                      id={`model-${asset.id}`}
                                      name="model"
                                      defaultValue={asset.model ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`serial-${asset.id}`}>Serial Number</Label>
                                    <Input
                                      id={`serial-${asset.id}`}
                                      name="serial_no"
                                      defaultValue={asset.serial_no ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`processor-${asset.id}`}>Processor</Label>
                                    <Input
                                      id={`processor-${asset.id}`}
                                      name="processor"
                                      defaultValue={asset.processor ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`ram-${asset.id}`}>RAM Capacity</Label>
                                    <Input
                                      id={`ram-${asset.id}`}
                                      name="ram_capacity"
                                      defaultValue={asset.ram_capacity ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`hdd-${asset.id}`}>Storage Capacity</Label>
                                    <Input
                                      id={`hdd-${asset.id}`}
                                      name="hdd_capacity"
                                      defaultValue={asset.hdd_capacity ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                </div>
                              </div>

                              <Separator className="bg-border" />

                              <div className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                  Peripherals
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`monitor-model-${asset.id}`}>Monitor Model</Label>
                                    <Input
                                      id={`monitor-model-${asset.id}`}
                                      name="monitor_model"
                                      defaultValue={asset.monitor_model ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`monitor-serial-${asset.id}`}>Monitor Serial No</Label>
                                    <Input
                                      id={`monitor-serial-${asset.id}`}
                                      name="monitor_serial_no"
                                      defaultValue={asset.monitor_serial_no ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`monitor-asset-${asset.id}`}>Monitor Asset No</Label>
                                    <Input
                                      id={`monitor-asset-${asset.id}`}
                                      name="monitor_asset_no"
                                      defaultValue={asset.monitor_asset_no ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`keyboard-model-${asset.id}`}>Keyboard Model</Label>
                                    <Input
                                      id={`keyboard-model-${asset.id}`}
                                      name="keyboard_model"
                                      defaultValue={asset.keyboard_model ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`keyboard-serial-${asset.id}`}>Keyboard Serial No</Label>
                                    <Input
                                      id={`keyboard-serial-${asset.id}`}
                                      name="keyboard_serial_no"
                                      defaultValue={asset.keyboard_serial_no ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`keyboard-asset-${asset.id}`}>Keyboard Asset No</Label>
                                    <Input
                                      id={`keyboard-asset-${asset.id}`}
                                      name="keyboard_asset_no"
                                      defaultValue={asset.keyboard_asset_no ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`mouse-model-${asset.id}`}>Mouse Model</Label>
                                    <Input
                                      id={`mouse-model-${asset.id}`}
                                      name="mouse_model"
                                      defaultValue={asset.mouse_model ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`mouse-serial-${asset.id}`}>Mouse Serial No</Label>
                                    <Input
                                      id={`mouse-serial-${asset.id}`}
                                      name="mouse_serial_no"
                                      defaultValue={asset.mouse_serial_no ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`mouse-asset-${asset.id}`}>Mouse Asset No</Label>
                                    <Input
                                      id={`mouse-asset-${asset.id}`}
                                      name="mouse_asset_no"
                                      defaultValue={asset.mouse_asset_no ?? ''}
                                      className="h-11"
                                    />
                                  </div>
                                </div>
                              </div>

                              <Separator className="bg-border" />

                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-2 md:col-span-2 xl:col-span-3">
                                  <Label htmlFor={`accessories-${asset.id}`}>Accessories</Label>
                                  <Input
                                    id={`accessories-${asset.id}`}
                                    name="accessories"
                                    defaultValue={asset.accessories ?? ''}
                                    className="h-11"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                <Button 
                                  type="submit" 
                                  className="w-full sm:w-auto"
                                >
                                  Update Asset
                                </Button>
                              </div>
                            </form>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                      
                      <AssetDeleteButton
                        action={deleteAsset}
                        assetId={asset.id}
                        redirectTo={basePath + '/assets'}
                        assetLabel={asset.asset_name || asset.asset_no || 'this asset'}
                      />
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

