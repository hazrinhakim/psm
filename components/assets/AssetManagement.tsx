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
import { AssetScanDialogButton } from '@/components/assets/AssetScanDialogButton'
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
  Wrench,
  Plus,
  Pencil,
  FileText,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Laptop,
  Printer,
  Monitor,
  HardDrive,
  Cpu,
  Mouse,
  Keyboard,
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

// Badge classes dengan gradient dan animation
function getStatusBadge(status: AssetStatus) {
  if (status === 'active') {
    return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
  }
  return 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border-slate-200 shadow-sm'
}

// Helper function untuk truncate text
function truncateText(text: string, maxLength: number = 15) {
  if (!text) return 'N/A'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Component untuk Asset Detail Dialog dengan design premium
function AssetDetailsDialog({ asset, statusLabel }: { asset: any; statusLabel: string }) {
  // Tentukan icon berdasarkan jenis asset
  const getAssetIcon = () => {
    const type = asset.type?.toLowerCase() || ''
    if (type.includes('laptop')) return Laptop
    if (type.includes('computer') || type.includes('desktop')) return Monitor
    if (type.includes('printer')) return Printer
    return Package
  }

  const AssetIcon = getAssetIcon()
  
  // Tentukan warna accent berdasarkan status
  const accentColor = statusLabel === 'active' ? 'from-emerald-400 to-emerald-300' : 'from-slate-400 to-slate-300'
  const iconBg = statusLabel === 'active' 
    ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-100'
    : 'bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 border-slate-100'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 h-9 rounded-full border-2 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group relative overflow-hidden"
        >
          <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-5xl sm:max-w-5xl max-h-[92vh] overflow-x-hidden ">
        <ScrollArea className="max-h-[80vh] pr-4">
          <DialogHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} shadow-lg`}>
                  <AssetIcon className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-800">
                    {asset.asset_name || 'Unnamed Asset'}
                  </DialogTitle>
                  <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-medium text-gray-600">
                      {asset.asset_no || 'N/A'}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span>{asset.asset_categories?.name || 'Uncategorized'}</span>
                  </DialogDescription>
                </div>
              </div>
              <Badge className={`${getStatusBadge(statusLabel === 'active' ? 'active' : 'inactive')} font-medium px-3 py-1`}>
                {statusLabel}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            {/* Overview Card */}
            <div className="rounded-xl border-2 border-gray-100 bg-gradient-to-br from-gray-50/50 to-white p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Overview
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Asset ID</p>
                  <p className="font-medium text-gray-800 break-words">{asset.asset_no || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium text-gray-800 break-words">{asset.type || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Year</p>
                  <p className="font-medium text-gray-800 break-words">{asset.year || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Model</p>
                  <p className="font-medium text-gray-800 break-words">{asset.model || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Serial No</p>
                  <p className="font-medium text-gray-800 break-words">{asset.serial_no || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">QR Code</p>
                  <p className="font-medium text-gray-800 break-words">{asset.qr_code || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Ownership Card */}
            <div className="rounded-xl border-2 border-gray-100 bg-gradient-to-br from-gray-50/50 to-white p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Ownership & Purchase
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium text-gray-800 break-words">{asset.department || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Unit</p>
                  <p className="font-medium text-gray-800 break-words">{asset.unit || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Assigned User</p>
                  <p className="font-medium text-gray-800 break-words">{asset.user_name || 'Unassigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Purchase Date</p>
                  <p className="font-medium text-gray-800">{formatDate(asset.purchase_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-medium text-gray-800">
                    {asset.price ? `RM ${parseFloat(asset.price).toLocaleString()}` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Supplier</p>
                  <p className="font-medium text-gray-800 break-words">{asset.supplier || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium text-gray-800 break-words">{asset.source || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Specifications Card */}
            {(asset.processor || asset.ram_capacity || asset.hdd_capacity) && (
              <div className="rounded-xl border-2 border-gray-100 bg-gradient-to-br from-gray-50/50 to-white p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  Device Specifications
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {asset.processor && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Processor</p>
                      <p className="font-medium text-gray-800 break-words">{asset.processor}</p>
                    </div>
                  )}
                  {asset.ram_capacity && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">RAM</p>
                      <p className="font-medium text-gray-800 break-words">{asset.ram_capacity}</p>
                    </div>
                  )}
                  {asset.hdd_capacity && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Storage</p>
                      <p className="font-medium text-gray-800 break-words">{asset.hdd_capacity}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Peripherals Card */}
            {(asset.monitor_model || asset.keyboard_model || asset.mouse_model) && (
              <div className="rounded-xl border-2 border-gray-100 bg-gradient-to-br from-gray-50/50 to-white p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Peripherals
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {asset.monitor_model && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Monitor</p>
                      <p className="font-medium text-gray-800 break-words">{asset.monitor_model}</p>
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
                      <p className="font-medium text-gray-800 break-words">{asset.keyboard_model}</p>
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
                      <p className="font-medium text-gray-800 break-words">{asset.mouse_model}</p>
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
            <div className="rounded-xl border-2 border-gray-100 bg-gradient-to-br from-gray-50/50 to-white p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Notes
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Accessories</p>
                  <p className="font-medium text-gray-800 break-words">
                    {asset.accessories || 'None'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Created Date</p>
                  <p className="font-medium text-gray-800">{formatDate(asset.created_at)}</p>
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

  const assetTypeSummaries = [
    { label: 'Computer', icon: Monitor, color: 'from-blue-400 to-blue-300' },
    { label: 'Laptop', icon: Laptop, color: 'from-emerald-400 to-emerald-300' },
    { label: 'Printer', icon: Printer, color: 'from-amber-400 to-amber-300' },
  ].map(({ label, icon, color }) => {
    const matches = (assets ?? []).filter((asset: any) => {
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

  const { count: maintenanceCount } = await supabase
    .from('maintenance_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['Pending', 'In Progress'])

  return (
    <div className="space-y-8 p-1 animate-in fade-in duration-700">
      {assigneeNames.length > 0 && (
        <datalist id="assignee-list">
          {assigneeNames.map(name => (
            <option key={name} value={name} />
          ))}
        </datalist>
      )}

      {/* Header Section - with premium styling */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in slide-in-from-left-4 duration-700">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Asset Management
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and track all your assets in one place
              </p>
            </div>
          </div>
        </div>
        {canManage && (
          <div className="flex items-center gap-3 animate-in slide-in-from-right-4 duration-700">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 shadow-md hover:shadow-lg transition-all duration-200 px-6 h-10 group">
                  <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Add Asset
                </Button>
              </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-6xl sm:max-w-6xl max-h-[92vh] overflow-x-hidden backdrop-blur-xl border border-white/20 shadow-2xl">
                  <ScrollArea className="max-h-[82vh] pr-4">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-800">
                        Register New Asset
                      </DialogTitle>
                      <DialogDescription>
                        Add a new asset to the catalog with its basic information.
                      </DialogDescription>
                    </DialogHeader>
                    <form action={createAsset} className="space-y-6">
                      <input type="hidden" name="redirectTo" value={basePath + '/assets'} />
                      
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          Basic Information
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="asset-no">Asset ID</Label>
                            <Input 
                              id="asset-no" 
                              name="asset_no" 
                              placeholder="AST-1001" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-name">Asset Name</Label>
                            <Input 
                              id="asset-name" 
                              name="asset_name" 
                              placeholder="Dell Latitude 5420" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
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
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
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

                      <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          Ownership & Purchase
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="asset-department">Department</Label>
                            <Input 
                              id="asset-department" 
                              name="department" 
                              placeholder="IT Department" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-unit">Unit</Label>
                            <Input 
                              id="asset-unit" 
                              name="unit" 
                              placeholder="Support Unit" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-user">Assigned User</Label>
                            <Input
                              id="asset-user"
                              name="user_name"
                              placeholder="Search signed-in user"
                              list={assigneeNames.length ? 'assignee-list' : undefined}
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
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
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-supplier">Supplier</Label>
                            <Input 
                              id="asset-supplier" 
                              name="supplier" 
                              placeholder="Dell Malaysia" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-source">Source</Label>
                            <Input 
                              id="asset-source" 
                              name="source" 
                              placeholder="Purchase / Donation" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-blue-600" />
                          Device Specifications
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="asset-model">Model</Label>
                            <Input 
                              id="asset-model" 
                              name="model" 
                              placeholder="Latitude 5420" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-serial">Serial Number</Label>
                            <Input 
                              id="asset-serial" 
                              name="serial_no" 
                              placeholder="SN12345" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-processor">Processor</Label>
                            <Input 
                              id="asset-processor" 
                              name="processor" 
                              placeholder="Intel i5" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-ram">RAM Capacity</Label>
                            <Input 
                              id="asset-ram" 
                              name="ram_capacity" 
                              placeholder="16 GB" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="asset-hdd">Storage Capacity</Label>
                            <Input 
                              id="asset-hdd" 
                              name="hdd_capacity" 
                              placeholder="512 GB SSD" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          Peripherals
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="monitor-model">Monitor Model</Label>
                            <Input 
                              id="monitor-model" 
                              name="monitor_model" 
                              placeholder="Dell P2419H" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monitor-serial">Monitor Serial No</Label>
                            <Input 
                              id="monitor-serial" 
                              name="monitor_serial_no" 
                              placeholder="MON12345" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monitor-asset">Monitor Asset No</Label>
                            <Input 
                              id="monitor-asset" 
                              name="monitor_asset_no" 
                              placeholder="MON-001" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="keyboard-model">Keyboard Model</Label>
                            <Input 
                              id="keyboard-model" 
                              name="keyboard_model" 
                              placeholder="Logitech K120" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="keyboard-serial">Keyboard Serial No</Label>
                            <Input 
                              id="keyboard-serial" 
                              name="keyboard_serial_no" 
                              placeholder="KB12345" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="keyboard-asset">Keyboard Asset No</Label>
                            <Input 
                              id="keyboard-asset" 
                              name="keyboard_asset_no" 
                              placeholder="KB-001" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mouse-model">Mouse Model</Label>
                            <Input 
                              id="mouse-model" 
                              name="mouse_model" 
                              placeholder="Logitech M185" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mouse-serial">Mouse Serial No</Label>
                            <Input 
                              id="mouse-serial" 
                              name="mouse_serial_no" 
                              placeholder="MS12345" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mouse-asset">Mouse Asset No</Label>
                            <Input 
                              id="mouse-asset" 
                              name="mouse_asset_no" 
                              placeholder="MS-001" 
                              className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="space-y-2 md:col-span-2 xl:col-span-3">
                          <Label htmlFor="asset-accessories">Accessories</Label>
                          <Input 
                            id="asset-accessories" 
                            name="accessories" 
                            placeholder="Docking station, bag" 
                            className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300" 
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
        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
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
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 animate-in slide-in-from-bottom-4 duration-500">
        {assetTypeSummaries.map((summary, index) => {
          const Icon = summary.icon
          // Different accent colors for each type
          const accentColors = {
            Computer: 'from-blue-400 to-blue-300',
            Laptop: 'from-emerald-400 to-emerald-300',
            Printer: 'from-amber-400 to-amber-300',
          }
          const iconBgColors = {
            Computer: 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 border border-blue-100',
            Laptop: 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 border border-emerald-100',
            Printer: 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 border border-amber-100',
          }
          const accentColor = accentColors[summary.label as keyof typeof accentColors] || 'from-gray-400 to-gray-300'
          const iconBg = iconBgColors[summary.label as keyof typeof iconBgColors] || 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 border border-gray-100'

          return (
            <Card 
              key={summary.label} 
              className="group relative overflow-hidden border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <CardContent className="pt-4 relative z-10">
                <div className="flex items-center justify-between">
                  
                  {/* Left Side (Number + Text) */}
                  <div>
                    <div className="text-3xl font-extrabold tracking-tight text-gray-900">
                      <AnimatedCount value={summary.count} />
                    </div>

                    <p className="text-sm font-semibold text-gray-700 mt-2">
                      {summary.label}s
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      Total assets
                    </p>
                  </div>

                  {/* Standout Icon */}
                  <div
                    className={`
                      relative flex h-14 w-14 items-center justify-center 
                      rounded-2xl bg-gradient-to-br ${accentColor}
                      shadow-lg shadow-black/10
                      group-hover:scale-110 group-hover:rotate-6
                      transition-all duration-300
                    `}
                  >
                    <Icon className="h-7 w-7 text-white drop-shadow-sm" />

                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                  </div>

                </div>

                {/* Corner Accent */}
                <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${accentColor} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search Field - with premium styling */}
      <AssetSearchForm basePath={basePath} query={query} />

      {/* Assets Grid - with premium card design */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {filteredAssets.length === 0 && (
          <div className="col-span-full h-80 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center animate-in fade-in duration-700">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 shadow-inner">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-700">
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
        
        {filteredAssets.map((asset: any, index: number) => {
          const status: AssetStatus =
            asset.user_name && String(asset.user_name).trim()
              ? 'active'
              : 'inactive'
          const statusLabel = getStatusLabel(status)
          
          // Determine accent color based on status
          const accentColor = status === 'active' ? 'from-emerald-400 to-emerald-300' : 'from-slate-400 to-slate-300'
          const iconBg = status === 'active'
            ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 border border-emerald-100'
            : 'bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 border border-slate-100'

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
              className="group relative overflow-hidden border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <CardHeader className="space-y-4 bg-gradient-to-r from-gray-50/50 to-white relative z-10">
              
                <div className="flex items-start justify-between gap-3 grid grid-cols-5">

                  <div className="flex items-start gap-3 min-w-0 flex-1 col-span-4">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <AssetIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 group/title">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CardTitle className="text-base font-bold text-gray-800 truncate cursor-default">
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
                        {truncateText(asset.asset_categories?.name ?? 'Uncategorized')}
                      </CardDescription>
                    </div>
                  </div>

                  <Badge className={`${getStatusBadge(status)} flex-shrink-0 font-thin text-xs px-2 py-0 shadow-sm col-span-1`}>
                    {statusLabel}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {asset.asset_name ?? 'Asset name'}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 text-sm text-muted-foreground pt-4 relative z-10">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span className="truncate font-medium text-gray-700">{asset.department ?? 'Department not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span className="truncate font-medium text-gray-700">{asset.user_name ?? 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span className="truncate font-medium text-gray-700">Purchased: {formatDate(asset.purchase_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span className="truncate font-medium text-gray-700">Type: {asset.type ?? 'Not set'}</span>
                </div>

                <div className="pt-4 border-t-2 border-gray-100 flex flex-wrap gap-2">
                  <AssetDetailsDialog asset={asset} statusLabel={statusLabel} />
                  
                  {canManage && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="gap-2 h-9 rounded-full border-2 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200 group relative overflow-hidden"
                          >
                            <Pencil className="h-4 w-4 transition-transform group-hover:scale-110" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-6xl sm:max-w-6xl max-h-[92vh] overflow-x-hidden">
                          <ScrollArea className="max-h-[82vh] pr-4">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-gray-800">
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
                                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-blue-600" />
                                  Basic Information
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`asset-no-${asset.id}`}>Asset ID</Label>
                                    <Input
                                      id={`asset-no-${asset.id}`}
                                      name="asset_no"
                                      defaultValue={asset.asset_no ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`asset-name-${asset.id}`}>Asset Name</Label>
                                    <Input
                                      id={`asset-name-${asset.id}`}
                                      name="asset_name"
                                      defaultValue={asset.asset_name ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
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
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`year-${asset.id}`}>Year</Label>
                                    <AssetYearPicker
                                      id={`year-${asset.id}`}
                                      name="year"
                                      defaultValue={asset.year ?? ''}
                                      placeholder="Pick year"
                                    />
                                  </div>
                                </div>
                              </div>

                              <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                              <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  Ownership & Purchase
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`department-${asset.id}`}>Department</Label>
                                    <Input
                                      id={`department-${asset.id}`}
                                      name="department"
                                      defaultValue={asset.department ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`unit-${asset.id}`}>Unit</Label>
                                    <Input
                                      id={`unit-${asset.id}`}
                                      name="unit"
                                      defaultValue={asset.unit ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`user-${asset.id}`}>Assigned User</Label>
                                    <Input
                                      id={`user-${asset.id}`}
                                      name="user_name"
                                      defaultValue={asset.user_name ?? ''}
                                      list={assigneeNames.length ? 'assignee-list' : undefined}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
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
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`supplier-${asset.id}`}>Supplier</Label>
                                    <Input
                                      id={`supplier-${asset.id}`}
                                      name="supplier"
                                      defaultValue={asset.supplier ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`source-${asset.id}`}>Source</Label>
                                    <Input
                                      id={`source-${asset.id}`}
                                      name="source"
                                      defaultValue={asset.source ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                </div>
                              </div>

                              <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                              <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  <Cpu className="h-4 w-4 text-blue-600" />
                                  Device Specifications
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`model-${asset.id}`}>Model</Label>
                                    <Input
                                      id={`model-${asset.id}`}
                                      name="model"
                                      defaultValue={asset.model ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`serial-${asset.id}`}>Serial Number</Label>
                                    <Input
                                      id={`serial-${asset.id}`}
                                      name="serial_no"
                                      defaultValue={asset.serial_no ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`processor-${asset.id}`}>Processor</Label>
                                    <Input
                                      id={`processor-${asset.id}`}
                                      name="processor"
                                      defaultValue={asset.processor ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`ram-${asset.id}`}>RAM Capacity</Label>
                                    <Input
                                      id={`ram-${asset.id}`}
                                      name="ram_capacity"
                                      defaultValue={asset.ram_capacity ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`hdd-${asset.id}`}>Storage Capacity</Label>
                                    <Input
                                      id={`hdd-${asset.id}`}
                                      name="hdd_capacity"
                                      defaultValue={asset.hdd_capacity ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                </div>
                              </div>

                              <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                              <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  <Package className="h-4 w-4 text-blue-600" />
                                  Peripherals
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`monitor-model-${asset.id}`}>Monitor Model</Label>
                                    <Input
                                      id={`monitor-model-${asset.id}`}
                                      name="monitor_model"
                                      defaultValue={asset.monitor_model ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`monitor-serial-${asset.id}`}>Monitor Serial No</Label>
                                    <Input
                                      id={`monitor-serial-${asset.id}`}
                                      name="monitor_serial_no"
                                      defaultValue={asset.monitor_serial_no ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`monitor-asset-${asset.id}`}>Monitor Asset No</Label>
                                    <Input
                                      id={`monitor-asset-${asset.id}`}
                                      name="monitor_asset_no"
                                      defaultValue={asset.monitor_asset_no ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`keyboard-model-${asset.id}`}>Keyboard Model</Label>
                                    <Input
                                      id={`keyboard-model-${asset.id}`}
                                      name="keyboard_model"
                                      defaultValue={asset.keyboard_model ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`keyboard-serial-${asset.id}`}>Keyboard Serial No</Label>
                                    <Input
                                      id={`keyboard-serial-${asset.id}`}
                                      name="keyboard_serial_no"
                                      defaultValue={asset.keyboard_serial_no ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`keyboard-asset-${asset.id}`}>Keyboard Asset No</Label>
                                    <Input
                                      id={`keyboard-asset-${asset.id}`}
                                      name="keyboard_asset_no"
                                      defaultValue={asset.keyboard_asset_no ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`mouse-model-${asset.id}`}>Mouse Model</Label>
                                    <Input
                                      id={`mouse-model-${asset.id}`}
                                      name="mouse_model"
                                      defaultValue={asset.mouse_model ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`mouse-serial-${asset.id}`}>Mouse Serial No</Label>
                                    <Input
                                      id={`mouse-serial-${asset.id}`}
                                      name="mouse_serial_no"
                                      defaultValue={asset.mouse_serial_no ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`mouse-asset-${asset.id}`}>Mouse Asset No</Label>
                                    <Input
                                      id={`mouse-asset-${asset.id}`}
                                      name="mouse_asset_no"
                                      defaultValue={asset.mouse_asset_no ?? ''}
                                      className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                    />
                                  </div>
                                </div>
                              </div>

                              <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-2 md:col-span-2 xl:col-span-3">
                                  <Label htmlFor={`accessories-${asset.id}`}>Accessories</Label>
                                  <Input
                                    id={`accessories-${asset.id}`}
                                    name="accessories"
                                    defaultValue={asset.accessories ?? ''}
                                    className="h-11 rounded-lg border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:border-gray-300"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                <Button 
                                  type="submit" 
                                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 group"
                                >
                                  <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
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
