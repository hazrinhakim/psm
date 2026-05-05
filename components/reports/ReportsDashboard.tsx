'use client'

import * as React from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Download,
  FileSpreadsheet,
  Filter,
  Shield,
  TriangleAlert,
  Wrench,
} from 'lucide-react'
import type {
  AssetReportFilterOption,
  AssetReportPeriod,
  CustomAssetReportFilters,
  CustomAssetReportResponse,
} from '@/lib/customAssetReport'
import { getDateRangeForPeriod } from '@/lib/customAssetReport'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type ReportsDashboardProps = {
  categoryOptions: AssetReportFilterOption[]
  initialFilters: CustomAssetReportFilters
  initialReport: CustomAssetReportResponse
}

const PERIOD_OPTIONS: { value: AssetReportPeriod; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (3 months)' },
  { value: 'half-yearly', label: 'Half-yearly (6 months)' },
  { value: 'yearly', label: 'Yearly' },
]

const timelineChartConfig = {
  assets: {
    label: 'Assets',
    color: '#F5F500',
  },
} satisfies ChartConfig

const categoryChartConfig = {
  assets: {
    label: 'Assets',
    color: '#F5F500',
  },
} satisfies ChartConfig

export function ReportsDashboard({
  categoryOptions,
  initialFilters,
  initialReport,
}: ReportsDashboardProps) {
  const [filters, setFilters] =
    React.useState<CustomAssetReportFilters>(initialFilters)
  const [report, setReport] =
    React.useState<CustomAssetReportResponse>(initialReport)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const deferredFilters = React.useDeferredValue(filters)

  React.useEffect(() => {
    const controller = new AbortController()
    const query = buildQueryString(deferredFilters)

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/reports/assets/custom?${query}`, {
          signal: controller.signal,
          credentials: 'same-origin',
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null
          throw new Error(payload?.error ?? 'Unable to load custom report.')
        }

        const payload = (await response.json()) as CustomAssetReportResponse
        setReport(payload)
      } catch (requestError) {
        if (controller.signal.aborted) {
          return
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load custom report.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => controller.abort()
  }, [deferredFilters])

  const timelineChartData = React.useMemo(
    () =>
      report.charts.timeline.labels.map((label, index) => ({
        label,
        assets: report.charts.timeline.data[index] ?? 0,
      })),
    [report.charts.timeline]
  )

  const categoryChartData = React.useMemo(
    () =>
      report.charts.categoryDistribution.labels.map((label, index) => ({
        label,
        assets: report.charts.categoryDistribution.data[index] ?? 0,
      })),
    [report.charts.categoryDistribution]
  )

  const handlePeriodChange = (period: AssetReportPeriod) => {
    const range = getDateRangeForPeriod(period)
    setFilters(current => ({
      ...current,
      period,
      startDate: range.startDate,
      endDate: range.endDate,
    }))
  }

  const handleExportExcel = () => {
    window.location.href = `/api/reports/assets/custom?${buildQueryString(
      filters,
      'excel'
    )}`
  }

  const handleExportPdf = () => {
    window.open(
      `/api/reports/assets/custom?${buildQueryString(filters, 'print')}`,
      '_blank',
      'noopener,noreferrer,width=1200,height=900'
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Reports & Analytics
        </CardTitle>
      </div>


      {error ? (
        <Card className="border-red-200 bg-red-50/80 shadow-none dark:border-red-500/20 dark:bg-red-500/10">
          <CardContent className="py-4 text-sm text-red-700 dark:text-red-200">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Timeline Breakdown
              </CardTitle>
              <CardDescription>
                Asset distribution over the selected {report.meta.periodLabel.toLowerCase()} period
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className={cn('h-80', loading && 'opacity-60')}>
            <ChartContainer
              config={timelineChartConfig}
              className="h-full w-full"
            >
              <ComposedChart
                accessibilityLayer
                data={timelineChartData}
                margin={{ left: 8, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="timelineAssetsFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-assets)" stopOpacity={0.3} />
                    <stop offset="70%" stopColor="var(--color-assets)" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="var(--color-assets)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="assets"
                  type="monotone"
                  fill="url(#timelineAssetsFade)"
                  stroke="none"
                />
                <Line
                  dataKey="assets"
                  type="monotone"
                  stroke="var(--color-assets)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Report Snapshot
            </CardTitle>
            <CardDescription>Current filter state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <InfoRow label="Period" value={report.meta.periodLabel} />
            <InfoRow label="Date Range" value={`${report.meta.startLabel} - ${report.meta.endLabel}`} />
            <InfoRow
              label="Categories"
              value={
                filters.categoryIds.length > 0
                  ? `${filters.categoryIds.length} selected`
                  : 'All'
              }
            />
            <InfoRow
              label="Generated"
              value={new Date(report.meta.generatedAt).toLocaleString('en-US')}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/70 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Asset Count by Category
            </CardTitle>
            <CardDescription>
              Filtered asset volume grouped by category
            </CardDescription>
          </CardHeader>
          <CardContent className={cn('h-80', loading && 'opacity-60')}>
            <ChartContainer
              config={categoryChartConfig}
              className="h-full w-full"
            >
              <BarChart
                accessibilityLayer
                data={categoryChartData}
                margin={{ left: 8, right: 8, top: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={20}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                  dataKey="assets"
                  fill="var(--color-assets)"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              Predictions & Recommendations
            </CardTitle>
            <CardDescription>
              Forward-looking asset risk scoring based on age and maintenance history
            </CardDescription>
          </div>
          <div className="rounded-full border border-blue-200/90 bg-blue-100/60 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/12 dark:text-blue-200">
            Forecast window: next 90 days
          </div>
        </CardHeader>
        <CardContent className={cn('space-y-6', loading && 'opacity-60')}>
          <div className="grid gap-3 md:grid-cols-3">
            <InsightStatCard
              label="High Risk Assets"
              value={report.insights.summary.highRiskAssets}
              helper="Immediate review candidates"
              tone="red"
            />
            <InsightStatCard
              label="Medium Risk Assets"
              value={report.insights.summary.mediumRiskAssets}
              helper="Preventive action recommended"
              tone="amber"
            />
            <InsightStatCard
              label="Predicted Maintenance"
              value={report.insights.summary.predictedMaintenanceNext90Days}
              helper="Estimated cases in 90 days"
              tone="blue"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-border/70 bg-card p-5">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Recommended actions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Suggested next steps based on current asset risk signals
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {report.insights.recommendations.map(item => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border/60 bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                      <span
                        className="rounded-full border border-blue-200/90 bg-blue-100/60 px-2.5 py-0.5 text-[11px] font-medium leading-5 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/12 dark:text-blue-200"
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-border/70 bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Risk overview
                </h3>
                <div className="mt-4 grid gap-3">
                  <MiniInsightRow
                    label="Highest Risk Category"
                    value={report.insights.trends.highestRiskCategory}
                  />
                  <MiniInsightRow
                    label="Recent Maintenance Load"
                    value={`${report.insights.trends.recentMaintenanceLoad} cases`}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card p-5">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      High-risk assets
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Assets that should be reviewed first
                    </p>
                  </div>

                  {report.insights.highRiskAssets.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
                      No high-risk assets detected for the current filters.
                    </div>
                  ) : (
                    report.insights.highRiskAssets.map(asset => (
                      <div
                        key={asset.id}
                        className="rounded-2xl border border-border/60 bg-muted/[0.14] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {asset.assetName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {[asset.assetNo, asset.type, asset.category].join(
                                ' / '
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            <TriangleAlert className="h-3.5 w-3.5" />
                            {asset.riskScore}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full border border-border/60 bg-background px-2.5 py-1">
                            Age {asset.ageYears} yrs
                          </span>
                          <span className="rounded-full border border-border/60 bg-background px-2.5 py-1">
                            {asset.maintenanceCount} maintenance cases
                          </span>
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700">
                            {asset.suggestedAction}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-base font-semibold">
              Detailed Category Distribution
            </CardTitle>
            <CardDescription>
              Asset count grouped by selected category
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button variant="outline" className="gap-2" onClick={handleExportPdf}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button className="gap-2" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-4 px-6 pb-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FilterField label="Category">
                <MultiSelectDropdown
                  placeholder="All categories"
                  selectedValues={filters.categoryIds}
                  options={categoryOptions}
                  onToggle={value =>
                    setFilters(current => ({
                      ...current,
                      categoryIds: toggleValue(current.categoryIds, value),
                    }))
                  }
                />
              </FilterField>

              <FilterField label="Time Period">
                <Select
                  value={filters.period}
                  onValueChange={value =>
                    handlePeriodChange(value as AssetReportPeriod)
                  }
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(initialFilters)}
                className="h-9 rounded-full border-border/70 bg-background px-4 text-foreground shadow-none hover:bg-muted/60"
              >
                Reset filters
              </Button>
              <p className="text-sm text-muted-foreground">
                Showing asset distribution from {report.meta.startLabel} to{' '}
                {report.meta.endLabel}.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr className="border-b">
                  <th className="py-4 pl-6 pr-3 font-medium">Category</th>
                  <th className="px-3 py-4 text-center font-medium">Total Assets</th>
                  <th className="px-6 py-4 text-center font-medium">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {report.charts.categoryDistribution.labels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="h-48 px-6 text-center text-muted-foreground"
                    >
                      No assets found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  report.charts.categoryDistribution.labels.map((label, index) => {
                    const count = report.charts.categoryDistribution.data[index] ?? 0
                    const share =
                      report.summary.totalAssets > 0
                        ? Number(((count / report.summary.totalAssets) * 100).toFixed(1))
                        : 0

                    return (
                      <tr
                        key={label}
                        className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                      >
                        <td className="py-4 pl-6 pr-3 font-medium text-foreground">
                          {label}
                        </td>
                        <td className="px-3 py-4 text-center font-medium text-foreground">
                          {count}
                        </td>
                        <td className="px-6 py-4 text-center text-muted-foreground">
                          {share}%
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function MultiSelectDropdown({
  placeholder,
  selectedValues,
  options,
  onToggle,
}: {
  placeholder: string
  selectedValues: string[]
  options: AssetReportFilterOption[]
  onToggle: (value: string) => void
}) {
  const summary =
    selectedValues.length === 0
      ? placeholder
      : selectedValues.length === 1
        ? options.find(option => option.value === selectedValues[0])?.label ??
          selectedValues[0]
        : `${selectedValues.length} selected`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-11 w-full justify-between">
          <span className="truncate">{summary}</span>
          <Filter className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
        <DropdownMenuLabel>Select options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map(option => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => onToggle(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}

function InsightStatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string | number
  helper: string
  tone: 'red' | 'amber' | 'blue' | 'emerald'
}) {
  const accentClass = cn(
    'inline-flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold',
    tone === 'red' &&
      'border-rose-200/70 bg-rose-100/50 text-rose-600 dark:border-rose-500/15 dark:bg-rose-500/12 dark:text-rose-300',
    tone === 'amber' &&
      'border-amber-200/70 bg-amber-100/50 text-amber-600 dark:border-amber-500/15 dark:bg-amber-500/12 dark:text-amber-300',
    tone === 'blue' &&
      'border-blue-200/70 bg-blue-100/55 text-blue-600 dark:border-blue-500/15 dark:bg-blue-500/12 dark:text-blue-300',
    tone === 'emerald' &&
      'border-emerald-200/70 bg-emerald-100/50 text-emerald-600 dark:border-emerald-500/15 dark:bg-emerald-500/12 dark:text-emerald-300'
  )

  const AccentIcon =
    tone === 'red'
      ? TriangleAlert
      : tone === 'amber'
        ? Shield
        : tone === 'blue'
          ? Wrench
          : Shield

  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">
              {label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
          </div>
          <div className={accentClass}>
            <AccentIcon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MiniInsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function toggleValue(values: string[], nextValue: string) {
  return values.includes(nextValue)
    ? values.filter(value => value !== nextValue)
    : [...values, nextValue]
}

function buildQueryString(
  filters: CustomAssetReportFilters,
  format?: 'excel' | 'print'
) {
  const params = new URLSearchParams()
  params.set('period', filters.period)
  params.set('startDate', filters.startDate)
  params.set('endDate', filters.endDate)

  for (const type of filters.assetTypes) {
    params.append('assetType', type)
  }

  for (const categoryId of filters.categoryIds) {
    params.append('categoryId', categoryId)
  }

  if (format) {
    params.set('format', format)
  }

  return params.toString()
}
