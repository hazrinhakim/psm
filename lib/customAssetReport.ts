import type { createSupabaseServerClient } from '@/lib/supabaseServer'

export type AssetReportPeriod =
  | 'monthly'
  | 'quarterly'
  | 'half-yearly'
  | 'yearly'

export type AssetReportFilterOption = {
  value: string
  label: string
}

export type CustomAssetReportFilters = {
  assetTypes: string[]
  categoryIds: string[]
  period: AssetReportPeriod
  startDate: string
  endDate: string
}

export type CustomAssetReportResponse = {
  filters: CustomAssetReportFilters
  meta: {
    generatedAt: string
    periodLabel: string
    startLabel: string
    endLabel: string
    timelineGranularity: 'day' | 'month'
  }
  summary: {
    totalAssets: number
    totalCategories: number
    totalTypes: number
    averagePerBucket: number
  }
  cards: Array<{
    label: string
    value: number
    description: string
    tone: 'blue' | 'emerald' | 'amber' | 'sky'
  }>
  charts: {
    typeDistribution: {
      labels: string[]
      data: number[]
    }
    categoryDistribution: {
      labels: string[]
      data: number[]
    }
    timeline: {
      labels: string[]
      data: number[]
    }
  }
  table: Array<{
    type: string
    category: string
    count: number
    share: number
  }>
  insights: {
    summary: {
      highRiskAssets: number
      mediumRiskAssets: number
      predictedMaintenanceNext90Days: number
      openMaintenanceCases: number
      overdueAttentionAssets: number
      preventiveCoveragePercent: number
      averageRiskScore: number
    }
    trends: {
      highestRiskType: string
      highestRiskCategory: string
      recentMaintenanceLoad: number
      unresolvedRate: number
      replacementExposure: number
      maintenanceFocusArea: string
    }
    recommendations: Array<{
      title: string
      detail: string
      priority: 'High' | 'Medium' | 'Low'
      owner: string
      confidence: 'High' | 'Medium' | 'Low'
    }>
    riskDistribution: {
      low: number
      medium: number
      high: number
      critical: number
    }
    maintenancePressure: Array<{
      label: string
      assetCount: number
      averageRiskScore: number
      openCases: number
      dueSoonCount: number
    }>
    highRiskAssets: Array<{
      id: string
      assetNo: string
      assetName: string
      type: string
      category: string
      ageYears: number
      riskScore: number
      maintenanceCount: number
      openCases: number
      lastMaintenanceAt: string | null
      nextServiceDate: string | null
      maintenanceMode: string
      suggestedAction: string
    }>
  }
}

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

type AssetRow = {
  id: string
  asset_no?: string | null
  asset_name?: string | null
  type?: string | null
  category_id?: string | null
  purchase_date?: string | null
  created_at?: string | null
  price?: number | string | null
  maintenance_enabled?: boolean | null
  maintenance_strategy?: string | null
  next_service_date?: string | null
  asset_categories?:
    | {
        name?: string | null
      }
    | {
        name?: string | null
      }[]
    | null
}

const PERIOD_LABELS: Record<AssetReportPeriod, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  'half-yearly': 'Half-yearly',
  yearly: 'Yearly',
}

export function getDefaultAssetReportFilters(
  period: AssetReportPeriod = 'yearly'
): CustomAssetReportFilters {
  const range = getDateRangeForPeriod(period)

  return {
    assetTypes: [],
    categoryIds: [],
    period,
    startDate: range.startDate,
    endDate: range.endDate,
  }
}

export function sanitizeAssetReportFilters(input: {
  assetTypes?: string[]
  categoryIds?: string[]
  period?: string | null
  startDate?: string | null
  endDate?: string | null
}): CustomAssetReportFilters {
  const period = normalizePeriod(input.period)
  const fallbackRange = getDateRangeForPeriod(period)
  const startDate = normalizeIsoDate(input.startDate) ?? fallbackRange.startDate
  const endDate = normalizeIsoDate(input.endDate) ?? fallbackRange.endDate

  if (startDate > endDate) {
    return {
      assetTypes: normalizeStringList(input.assetTypes),
      categoryIds: normalizeStringList(input.categoryIds),
      period,
      startDate: endDate,
      endDate: startDate,
    }
  }

  return {
    assetTypes: normalizeStringList(input.assetTypes),
    categoryIds: normalizeStringList(input.categoryIds),
    period,
    startDate,
    endDate,
  }
}

export function getDateRangeForPeriod(
  period: AssetReportPeriod,
  baseDate = new Date()
) {
  const end = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate()
  )
  const start = new Date(end)

  if (period === 'monthly') {
    start.setMonth(start.getMonth() - 1)
    start.setDate(start.getDate() + 1)
  } else if (period === 'quarterly') {
    start.setMonth(start.getMonth() - 3)
    start.setDate(start.getDate() + 1)
  } else if (period === 'half-yearly') {
    start.setMonth(start.getMonth() - 6)
    start.setDate(start.getDate() + 1)
  } else {
    start.setFullYear(start.getFullYear() - 1)
    start.setDate(start.getDate() + 1)
  }

  return {
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
  }
}

export async function getAssetReportFilterOptions(
  supabase: SupabaseServerClient
) {
  const [{ data: categories }, { data: assets }] = await Promise.all([
    supabase.from('asset_categories').select('id, name').order('name'),
    supabase.from('assets').select('type').not('type', 'is', null),
  ])

  const assetTypeOptions = Array.from(
    new Set(
      (assets ?? [])
        .map(asset => asset.type)
        .filter((value): value is string => typeof value === 'string')
        .map(value => value.trim())
        .filter(Boolean)
    )
  )
    .sort((a, b) => a.localeCompare(b))
    .map(value => ({
      value,
      label: value,
    }))

  const categoryOptions = (categories ?? []).map(category => ({
    value: category.id,
    label: category.name,
  }))

  return {
    assetTypeOptions,
    categoryOptions,
  }
}

export async function buildCustomAssetReport(
  supabase: SupabaseServerClient,
  rawFilters: Partial<CustomAssetReportFilters> = {}
): Promise<CustomAssetReportResponse> {
  const filters = sanitizeAssetReportFilters(rawFilters)

  const { data, error } = await supabase.from('assets').select(`
      id,
      asset_no,
      asset_name,
      type,
      category_id,
      purchase_date,
      created_at,
      price,
      maintenance_enabled,
      maintenance_strategy,
      next_service_date,
      asset_categories ( name )
    `)

  if (error) {
    throw new Error(error.message)
  }

  const assets = ((data as AssetRow[] | null) ?? []).filter(asset => {
    const type = normalizeLabel(asset.type, 'Other')
    const categoryId = asset.category_id ?? ''
    const assetDate = getAssetDate(asset)

    if (!assetDate) {
      return false
    }

    if (filters.assetTypes.length > 0 && !filters.assetTypes.includes(type)) {
      return false
    }

    if (
      filters.categoryIds.length > 0 &&
      !filters.categoryIds.includes(categoryId)
    ) {
      return false
    }

    return assetDate >= filters.startDate && assetDate <= filters.endDate
  })

  const typeCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()
  const pairCounts = new Map<string, { type: string; category: string; count: number }>()
  const timelineBuckets = createTimelineBuckets(filters)

  for (const asset of assets) {
    const type = normalizeLabel(asset.type, 'Other')
    const category = getCategoryName(asset)
    const assetDate = getAssetDate(asset)

    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1)
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)

    const pairKey = `${type}::${category}`
    const pair = pairCounts.get(pairKey)
    if (pair) {
      pair.count += 1
    } else {
      pairCounts.set(pairKey, {
        type,
        category,
        count: 1,
      })
    }

    if (!assetDate) {
      continue
    }

    const bucketKey =
      filters.period === 'monthly' ? assetDate : assetDate.slice(0, 7)
    const bucket = timelineBuckets.get(bucketKey)
    if (bucket) {
      bucket.count += 1
    }
  }

  const totalAssets = assets.length
  const timelineEntries = Array.from(timelineBuckets.values())
  const totalCategories = categoryCounts.size
  const totalTypes = typeCounts.size
  const insights = await buildAssetForecastInsights(supabase, assets)

  return {
    filters,
    meta: {
      generatedAt: new Date().toISOString(),
      periodLabel: PERIOD_LABELS[filters.period],
      startLabel: formatDateLabel(filters.startDate),
      endLabel: formatDateLabel(filters.endDate),
      timelineGranularity: filters.period === 'monthly' ? 'day' : 'month',
    },
    summary: {
      totalAssets,
      totalCategories,
      totalTypes,
      averagePerBucket:
        timelineEntries.length > 0
          ? Number((totalAssets / timelineEntries.length).toFixed(1))
          : 0,
    },
    cards: [
      {
        label: 'Filtered Assets',
        value: totalAssets,
        description: 'Assets inside the selected range',
        tone: 'blue',
      },
      {
        label: 'Preventive Coverage',
        value: Math.round(insights.summary.preventiveCoveragePercent),
        description: 'Assets with maintenance profile enabled (%)',
        tone: 'emerald',
      },
      {
        label: 'Open Cases',
        value: insights.summary.openMaintenanceCases,
        description: 'Active unresolved maintenance requests',
        tone: 'amber',
      },
      {
        label: 'Overdue Attention',
        value: insights.summary.overdueAttentionAssets,
        description: 'Assets needing immediate action',
        tone: 'sky',
      },
    ],
    charts: {
      typeDistribution: mapCountsToChart(typeCounts),
      categoryDistribution: mapCountsToChart(categoryCounts),
      timeline: {
        labels: timelineEntries.map(item => item.label),
        data: timelineEntries.map(item => item.count),
      },
    },
    table: Array.from(pairCounts.values())
      .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))
      .map(item => ({
        ...item,
        share:
          totalAssets > 0
            ? Number(((item.count / totalAssets) * 100).toFixed(1))
            : 0,
      })),
    insights,
  }
}

export async function buildCustomAssetReportExcel(
  report: CustomAssetReportResponse
) {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const generatedAt = new Date(report.meta.generatedAt)
  const topType = report.charts.typeDistribution.labels[0] ?? 'No data'
  const topTypeValue = report.charts.typeDistribution.data[0] ?? 0
  const topCategory = report.charts.categoryDistribution.labels[0] ?? 'No data'
  const topCategoryValue = report.charts.categoryDistribution.data[0] ?? 0
  const peakTimelineIndex = report.charts.timeline.data.reduce(
    (bestIndex, value, index, values) =>
      value > (values[bestIndex] ?? -1) ? index : bestIndex,
    0
  )
  const peakTimelineLabel = report.charts.timeline.labels[peakTimelineIndex] ?? 'No data'
  const peakTimelineValue = report.charts.timeline.data[peakTimelineIndex] ?? 0

  workbook.creator = 'psm-project'
  workbook.created = generatedAt
  workbook.modified = generatedAt
  workbook.title = 'Custom Asset Report'
  workbook.subject = 'Asset analytics export'

  const summarySheet = workbook.addWorksheet('Summary', {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 3 }],
  })

  summarySheet.columns = [
    { width: 24 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ]

  summarySheet.mergeCells('A1:E1')
  const titleCell = summarySheet.getCell('A1')
  titleCell.value = 'Custom Asset Report'
  titleCell.font = { size: 18, bold: true, color: { argb: 'FF0F172A' } }
  titleCell.alignment = { vertical: 'middle' }
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' },
  }
  summarySheet.getRow(1).height = 28

  summarySheet.mergeCells('A2:E2')
  const subtitleCell = summarySheet.getCell('A2')
  subtitleCell.value = `Generated ${generatedAt.toLocaleString('en-US')}`
  subtitleCell.font = { size: 10, color: { argb: 'FF475569' } }
  subtitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' },
  }

  summarySheet.mergeCells('A4:E4')
  const bannerCell = summarySheet.getCell('A4')
  bannerCell.value =
    'Integrated Campus Asset Management System | Administrative reporting export'
  bannerCell.font = { size: 10, bold: true, color: { argb: 'FF0F766E' } }
  bannerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0FDFA' },
  }
  bannerCell.border = createExcelBorder()

  const metadataStartRow = 6
  const metadataRows: Array<[string, string]> = [
    ['Period', report.meta.periodLabel],
    ['Date Range', `${report.meta.startLabel} - ${report.meta.endLabel}`],
    ['Selected Types', report.filters.assetTypes.join(', ') || 'All'],
    [
      'Selected Categories',
      report.filters.categoryIds.join(', ') || 'All categories',
    ],
  ]

  for (const [index, [label, value]] of metadataRows.entries()) {
    const row = summarySheet.getRow(metadataStartRow + index)
    row.getCell(1).value = label
    row.getCell(1).font = { bold: true, color: { argb: 'FF0F172A' } }
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8FAFC' },
    }
    row.getCell(2).value = value
    row.getCell(2).font = { color: { argb: 'FF334155' } }
    row.getCell(1).border = createExcelBorder()
    row.getCell(2).border = createExcelBorder()
  }

  const cardHeaderRow = 13
  summarySheet.getRow(cardHeaderRow).getCell(1).value = 'Executive Summary'
  summarySheet.getRow(cardHeaderRow).getCell(1).font = {
    bold: true,
    size: 12,
    color: { argb: 'FF0F172A' },
  }

  const summaryCards = [
    ['Filtered Assets', report.summary.totalAssets, 'Assets inside the selected range'],
    ['Asset Types', report.summary.totalTypes, 'Matching type groups'],
    ['Categories', report.summary.totalCategories, 'Matching category groups'],
    ['Average / Bucket', report.summary.averagePerBucket, 'Average assets per timeline bucket'],
  ] as const

  for (const [index, [label, value, helper]] of summaryCards.entries()) {
    const columnIndex = index + 1
    const labelCell = summarySheet.getRow(cardHeaderRow + 1).getCell(columnIndex)
    const valueCell = summarySheet.getRow(cardHeaderRow + 2).getCell(columnIndex)
    const helperCell = summarySheet.getRow(cardHeaderRow + 3).getCell(columnIndex)

    labelCell.value = label
    valueCell.value = value
    helperCell.value = helper

    for (const cell of [labelCell, valueCell, helperCell]) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' },
      }
      cell.border = createExcelBorder()
    }

    labelCell.font = { size: 10, bold: true, color: { argb: 'FF475569' } }
    valueCell.font = { size: 16, bold: true, color: { argb: 'FF0F172A' } }
    helperCell.font = { size: 10, color: { argb: 'FF64748B' } }
    helperCell.alignment = { wrapText: true, vertical: 'top' }
  }

  summarySheet.getRow(cardHeaderRow + 3).height = 34

  const insightTitleRow = 18
  summarySheet.getRow(insightTitleRow).getCell(1).value = 'Key Highlights'
  summarySheet.getRow(insightTitleRow).getCell(1).font = {
    bold: true,
    size: 12,
    color: { argb: 'FF0F172A' },
  }

  const insightRows: Array<[string, string]> = [
    ['Top Asset Type', `${topType} (${topTypeValue})`],
    ['Top Category', `${topCategory} (${topCategoryValue})`],
    ['Peak Timeline Bucket', `${peakTimelineLabel} (${peakTimelineValue})`],
  ]

  for (const [index, [label, value]] of insightRows.entries()) {
    const row = summarySheet.getRow(insightTitleRow + 1 + index)
    row.getCell(1).value = label
    row.getCell(1).font = { bold: true, color: { argb: 'FF0F172A' } }
    row.getCell(2).value = value
    row.getCell(2).font = { color: { argb: 'FF334155' } }
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFBEB' },
    }
    row.getCell(1).border = createExcelBorder()
    row.getCell(2).border = createExcelBorder()
  }

  const forecastTitleRow = 23
  summarySheet.getRow(forecastTitleRow).getCell(1).value =
    'Predictions & Recommendations'
  summarySheet.getRow(forecastTitleRow).getCell(1).font = {
    bold: true,
    size: 12,
    color: { argb: 'FF0F172A' },
  }

  const forecastRows: Array<[string, string | number]> = [
    ['High Risk Assets', report.insights.summary.highRiskAssets],
    ['Medium Risk Assets', report.insights.summary.mediumRiskAssets],
    ['Open Maintenance Cases', report.insights.summary.openMaintenanceCases],
    ['Overdue Attention Assets', report.insights.summary.overdueAttentionAssets],
    ['Preventive Coverage', `${report.insights.summary.preventiveCoveragePercent}%`],
    ['Average Risk Score', report.insights.summary.averageRiskScore],
    [
      'Predicted Maintenance (90 days)',
      report.insights.summary.predictedMaintenanceNext90Days,
    ],
    ['Highest Risk Type', report.insights.trends.highestRiskType],
    ['Highest Risk Category', report.insights.trends.highestRiskCategory],
    ['Recent Maintenance Load', `${report.insights.trends.recentMaintenanceLoad} cases`],
    ['Unresolved Rate', `${report.insights.trends.unresolvedRate}%`],
    ['Maintenance Focus Area', report.insights.trends.maintenanceFocusArea],
  ]

  for (const [index, [label, value]] of forecastRows.entries()) {
    const row = summarySheet.getRow(forecastTitleRow + 1 + index)
    row.getCell(1).value = label
    row.getCell(1).font = { bold: true, color: { argb: 'FF0F172A' } }
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F9FF' },
    }
    row.getCell(2).value = value
    row.getCell(2).font = { color: { argb: 'FF334155' } }
    row.getCell(1).border = createExcelBorder()
    row.getCell(2).border = createExcelBorder()
  }

  const recommendationsTitleRow = forecastTitleRow + forecastRows.length + 3
  summarySheet.getRow(recommendationsTitleRow).getCell(1).value =
    'Recommended Actions'
  summarySheet.getRow(recommendationsTitleRow).getCell(1).font = {
    bold: true,
    size: 12,
    color: { argb: 'FF0F172A' },
  }

  report.insights.recommendations.forEach((item, index) => {
    const row = summarySheet.getRow(recommendationsTitleRow + 1 + index)
    row.getCell(1).value = item.title
    row.getCell(1).font = { bold: true, color: { argb: 'FF0F172A' } }
    row.getCell(2).value = item.detail
    row.getCell(2).font = { color: { argb: 'FF334155' } }
    row.getCell(3).value = item.priority.toUpperCase()
    row.getCell(3).font = { bold: true, color: { argb: 'FF1D4ED8' } }
    row.getCell(4).value = item.owner
    row.getCell(4).font = { color: { argb: 'FF334155' } }
    row.getCell(5).value = item.confidence
    row.getCell(5).font = { bold: true, color: { argb: 'FF0F766E' } }
    row.getCell(1).border = createExcelBorder()
    row.getCell(2).border = createExcelBorder()
    row.getCell(3).border = createExcelBorder()
    row.getCell(4).border = createExcelBorder()
    row.getCell(5).border = createExcelBorder()
  })

  let currentRow = recommendationsTitleRow + report.insights.recommendations.length + 3
  currentRow = writeExcelSection(summarySheet, currentRow, 'Timeline Breakdown', [
    ['Label', 'Count'],
    ...report.charts.timeline.labels.map((label, index) => [
      label,
      report.charts.timeline.data[index] ?? 0,
    ]),
  ])

  currentRow = writeExcelSection(summarySheet, currentRow + 2, 'Type Distribution', [
    ['Type', 'Count'],
    ...report.charts.typeDistribution.labels.map((label, index) => [
      label,
      report.charts.typeDistribution.data[index] ?? 0,
    ]),
  ])

  writeExcelSection(summarySheet, currentRow + 2, 'Category Distribution', [
    ['Category', 'Count'],
    ...report.charts.categoryDistribution.labels.map((label, index) => [
      label,
      report.charts.categoryDistribution.data[index] ?? 0,
    ]),
  ])

  const detailSheet = workbook.addWorksheet('Detailed Distribution', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  detailSheet.columns = [
    { header: 'Type', key: 'type', width: 28 },
    { header: 'Category', key: 'category', width: 28 },
    { header: 'Count', key: 'count', width: 14 },
    { header: 'Share %', key: 'share', width: 14 },
  ]
  detailSheet.autoFilter = 'A1:D1'

  styleExcelHeaderRow(detailSheet.getRow(1))

  for (const item of report.table) {
    const row = detailSheet.addRow({
      type: item.type,
      category: item.category,
      count: item.count,
      share: item.share / 100,
    })
    row.getCell('count').numFmt = '0'
    row.getCell('share').numFmt = '0.0%'
  }

  detailSheet.eachRow((row, rowNumber) => {
    row.eachCell(cell => {
      cell.border = createExcelBorder()
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        }
      }
    })
  })

  const riskSheet = workbook.addWorksheet('High Risk Assets', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  riskSheet.columns = [
    { header: 'Asset ID', key: 'assetNo', width: 22 },
    { header: 'Asset Name', key: 'assetName', width: 30 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Category', key: 'category', width: 24 },
    { header: 'Mode', key: 'maintenanceMode', width: 16 },
    { header: 'Age (Years)', key: 'ageYears', width: 14 },
    { header: 'Risk Score', key: 'riskScore', width: 14 },
    { header: 'Maintenance Cases', key: 'maintenanceCount', width: 18 },
    { header: 'Open Cases', key: 'openCases', width: 14 },
    { header: 'Next Service', key: 'nextServiceDate', width: 18 },
    { header: 'Last Maintenance', key: 'lastMaintenanceAt', width: 22 },
    { header: 'Suggested Action', key: 'suggestedAction', width: 24 },
  ]
  riskSheet.autoFilter = 'A1:K1'

  styleExcelHeaderRow(riskSheet.getRow(1))

  for (const item of report.insights.highRiskAssets) {
    riskSheet.addRow({
      assetNo: item.assetNo,
      assetName: item.assetName,
      type: item.type,
      category: item.category,
      maintenanceMode: item.maintenanceMode,
      ageYears: item.ageYears,
      riskScore: item.riskScore,
      maintenanceCount: item.maintenanceCount,
      openCases: item.openCases,
      nextServiceDate: item.nextServiceDate
        ? new Date(item.nextServiceDate).toLocaleDateString('en-US')
        : 'N/A',
      lastMaintenanceAt: item.lastMaintenanceAt
        ? new Date(item.lastMaintenanceAt).toLocaleDateString('en-US')
        : 'N/A',
      suggestedAction: item.suggestedAction,
    })
  }

  riskSheet.eachRow((row, rowNumber) => {
    row.eachCell(cell => {
      cell.border = createExcelBorder()
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFBEB' },
        }
      }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

function normalizePeriod(period?: string | null): AssetReportPeriod {
  if (
    period === 'monthly' ||
    period === 'quarterly' ||
    period === 'half-yearly' ||
    period === 'yearly'
  ) {
    return period
  }

  return 'yearly'
}

function normalizeStringList(values?: string[]) {
  return Array.from(
    new Set((values ?? []).map(value => value.trim()).filter(Boolean))
  )
}

function normalizeIsoDate(value?: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return toIsoDate(date)
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getAssetDate(asset: AssetRow) {
  return normalizeIsoDate(asset.purchase_date ?? asset.created_at ?? null)
}

function getCategoryName(asset: AssetRow) {
  if (Array.isArray(asset.asset_categories)) {
    return normalizeLabel(asset.asset_categories[0]?.name, 'Uncategorized')
  }

  return normalizeLabel(asset.asset_categories?.name, 'Uncategorized')
}

function normalizeLabel(value: string | null | undefined, fallback: string) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return normalized || fallback
}

function createTimelineBuckets(filters: CustomAssetReportFilters) {
  const buckets = new Map<string, { label: string; count: number }>()
  const start = new Date(filters.startDate)
  const end = new Date(filters.endDate)

  if (filters.period === 'monthly') {
    for (
      const cursor = new Date(start);
      cursor <= end;
      cursor.setDate(cursor.getDate() + 1)
    ) {
      const key = toIsoDate(cursor)
      buckets.set(key, {
        label: cursor.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        count: 0,
      })
    }

    return buckets
  }

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  const last = new Date(end.getFullYear(), end.getMonth(), 1)

  while (cursor <= last) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    buckets.set(key, {
      label: cursor.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      count: 0,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return buckets
}

function mapCountsToChart(counts: Map<string, number>) {
  const entries = Array.from(counts.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  )

  return {
    labels: entries.map(([label]) => label),
    data: entries.map(([, count]) => count),
  }
}

type MaintenanceRequestRow = {
  asset_id?: string | null
  status?: string | null
  created_at?: string | null
  due_date?: string | null
}

async function buildAssetForecastInsights(
  supabase: SupabaseServerClient,
  assets: AssetRow[]
) {
  if (assets.length === 0) {
    return {
      summary: {
        highRiskAssets: 0,
        mediumRiskAssets: 0,
        predictedMaintenanceNext90Days: 0,
        openMaintenanceCases: 0,
        overdueAttentionAssets: 0,
        preventiveCoveragePercent: 0,
        averageRiskScore: 0,
      },
      trends: {
        highestRiskType: 'No data',
        highestRiskCategory: 'No data',
        recentMaintenanceLoad: 0,
        unresolvedRate: 0,
        replacementExposure: 0,
        maintenanceFocusArea: 'No data',
      },
      recommendations: [
        {
          title: 'No recommendation available',
          detail:
            'Add assets or widen the selected filters to generate predictive insights.',
          priority: 'Low' as const,
          owner: 'Admin',
          confidence: 'Low' as const,
        },
      ],
      riskDistribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      maintenancePressure: [],
      highRiskAssets: [],
    }
  }

  const assetIds = assets.map(asset => asset.id)
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('asset_id, status, created_at, due_date')
    .in('asset_id', assetIds)

  if (error) {
    throw new Error(error.message)
  }

  const today = new Date()
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  )
  const recentCutoff = new Date()
  recentCutoff.setDate(recentCutoff.getDate() - 90)

  const maintenanceByAsset = new Map<
    string,
    {
      total: number
      recent90: number
      unresolved: number
      overdueOpen: number
      dueSoonOpen: number
      lastMaintenanceAt: string | null
    }
  >()

  for (const row of (data ?? []) as MaintenanceRequestRow[]) {
    const assetId = row.asset_id ?? ''
    if (!assetId) {
      continue
    }

    const entry = maintenanceByAsset.get(assetId) ?? {
      total: 0,
      recent90: 0,
      unresolved: 0,
      overdueOpen: 0,
      dueSoonOpen: 0,
      lastMaintenanceAt: null,
    }

    entry.total += 1

    const maintenanceDate = parseDate(row.created_at)
    if (maintenanceDate && maintenanceDate >= recentCutoff) {
      entry.recent90 += 1
    }

    const normalizedStatus = String(row.status ?? '').trim().toLowerCase()
    if (
      normalizedStatus === 'pending' ||
      normalizedStatus === 'in progress' ||
      normalizedStatus === 'in_progress'
    ) {
      entry.unresolved += 1

      const dueDate = parseDate(row.due_date)
      if (dueDate) {
        const dueUtc = Date.UTC(
          dueDate.getUTCFullYear(),
          dueDate.getUTCMonth(),
          dueDate.getUTCDate()
        )
        const daysUntilDue = Math.floor((dueUtc - todayUtc) / 86400000)

        if (daysUntilDue < 0) {
          entry.overdueOpen += 1
        } else if (daysUntilDue <= 30) {
          entry.dueSoonOpen += 1
        }
      }
    }

    if (maintenanceDate) {
      const isoDate = maintenanceDate.toISOString()
      if (!entry.lastMaintenanceAt || isoDate > entry.lastMaintenanceAt) {
        entry.lastMaintenanceAt = isoDate
      }
    }

    maintenanceByAsset.set(assetId, entry)
  }

  const typeRisk = new Map<string, number>()
  const categoryRisk = new Map<string, number>()
  const categoryPressure = new Map<
    string,
    {
      assetCount: number
      totalRiskScore: number
      openCases: number
      dueSoonCount: number
    }
  >()

  const scoredAssets = assets.map(asset => {
    const type = normalizeLabel(asset.type, 'Other')
    const category = getCategoryName(asset)
    const ageYears = getAgeInYears(asset)
    const maintenanceMode = asset.maintenance_enabled
      ? normalizeMaintenanceMode(asset.maintenance_strategy)
      : 'Corrective'
    const nextServiceDate = parseDate(asset.next_service_date)
    const nextServiceDelta = nextServiceDate
      ? getDaysUntilDate(nextServiceDate, todayUtc)
      : null
    const maintenance = maintenanceByAsset.get(asset.id) ?? {
      total: 0,
      recent90: 0,
      unresolved: 0,
      overdueOpen: 0,
      dueSoonOpen: 0,
      lastMaintenanceAt: null,
    }

    const ageScore = Math.min(ageYears * 8, 28)
    const maintenanceScore = Math.min(maintenance.total * 7, 18)
    const recentScore = Math.min(maintenance.recent90 * 9, 18)
    const unresolvedScore = Math.min(maintenance.unresolved * 10, 16)
    const overdueScore = Math.min(maintenance.overdueOpen * 18, 24)
    const dueSoonScore = Math.min(maintenance.dueSoonOpen * 8, 12)
    const preventiveGapScore = asset.maintenance_enabled ? 0 : 8
    const serviceWindowScore =
      nextServiceDelta === null
        ? asset.maintenance_enabled
          ? 6
          : 0
        : nextServiceDelta < 0
          ? 16
          : nextServiceDelta <= 30
            ? 9
            : 0
    const riskScore = Math.min(
      Math.round(
        ageScore +
          maintenanceScore +
          recentScore +
          unresolvedScore +
          overdueScore +
          dueSoonScore +
          preventiveGapScore +
          serviceWindowScore
      ),
      100
    )
    const dueSoonCount =
      maintenance.dueSoonOpen +
      (nextServiceDelta !== null && nextServiceDelta >= 0 && nextServiceDelta <= 30
        ? 1
        : 0)
    const openCases = maintenance.unresolved

    typeRisk.set(type, (typeRisk.get(type) ?? 0) + riskScore)
    categoryRisk.set(category, (categoryRisk.get(category) ?? 0) + riskScore)
    categoryPressure.set(category, {
      assetCount: (categoryPressure.get(category)?.assetCount ?? 0) + 1,
      totalRiskScore:
        (categoryPressure.get(category)?.totalRiskScore ?? 0) + riskScore,
      openCases: (categoryPressure.get(category)?.openCases ?? 0) + openCases,
      dueSoonCount:
        (categoryPressure.get(category)?.dueSoonCount ?? 0) + dueSoonCount,
    })

    return {
      id: asset.id,
      assetNo: normalizeLabel(asset.asset_no, asset.id),
      assetName: normalizeLabel(asset.asset_name, 'Unnamed asset'),
      type,
      category,
      ageYears,
      riskScore,
      maintenanceCount: maintenance.total,
      openCases,
      recentMaintenanceCount: maintenance.recent90,
      lastMaintenanceAt: maintenance.lastMaintenanceAt,
      nextServiceDate: asset.next_service_date ?? null,
      maintenanceMode,
      estimatedReplacementCost: normalizeCurrencyNumber(asset.price),
      suggestedAction: getSuggestedAction(
        riskScore,
        ageYears,
        maintenance.total,
        maintenance.unresolved,
        nextServiceDelta
      ),
    }
  })

  const highRiskAssets = scoredAssets
    .filter(asset => asset.riskScore >= 60)
    .sort(
      (a, b) =>
        b.riskScore - a.riskScore ||
        b.openCases - a.openCases ||
        b.maintenanceCount - a.maintenanceCount
    )
  const mediumRiskAssets = scoredAssets.filter(
    asset => asset.riskScore >= 35 && asset.riskScore < 60
  )
  const criticalRiskAssets = scoredAssets.filter(asset => asset.riskScore >= 80)
  const predictedMaintenanceNext90Days = Math.round(
    scoredAssets.reduce((sum, asset) => {
      if (asset.riskScore >= 80) return sum + 1
      if (asset.riskScore >= 60) return sum + 0.7
      if (asset.riskScore >= 35) return sum + 0.35
      return sum + 0.08
    }, 0)
  )
  const recentMaintenanceLoad = Array.from(maintenanceByAsset.values()).reduce(
    (sum, item) => sum + item.recent90,
    0
  )
  const highestRiskType = getTopCountLabel(typeRisk)
  const highestRiskCategory = getTopCountLabel(categoryRisk)
  const openMaintenanceCases = Array.from(maintenanceByAsset.values()).reduce(
    (sum, item) => sum + item.unresolved,
    0
  )
  const preventiveCoveragePercent = Number(
    (
      (assets.filter(asset => asset.maintenance_enabled).length / assets.length) *
      100
    ).toFixed(1)
  )
  const averageRiskScore = Number(
    (
      scoredAssets.reduce((sum, asset) => sum + asset.riskScore, 0) /
      scoredAssets.length
    ).toFixed(1)
  )
  const overdueAttentionAssets = scoredAssets.filter(asset => {
    if (asset.openCases > 0 && asset.riskScore >= 60) return true
    if (!asset.nextServiceDate) return false

    const nextServiceDate = parseDate(asset.nextServiceDate)
    if (!nextServiceDate) return false
    return getDaysUntilDate(nextServiceDate, todayUtc) < 0
  }).length
  const unresolvedRate = Number(
    (
      (openMaintenanceCases / Math.max((data ?? []).length, 1)) *
      100
    ).toFixed(1)
  )
  const replacementExposure = scoredAssets
    .filter(asset => asset.riskScore >= 80)
    .reduce((sum, asset) => sum + (asset.estimatedReplacementCost ?? 0), 0)
  const maintenancePressure = Array.from(categoryPressure.entries())
    .map(([label, entry]) => ({
      label,
      assetCount: entry.assetCount,
      averageRiskScore: Number(
        (entry.totalRiskScore / Math.max(entry.assetCount, 1)).toFixed(1)
      ),
      openCases: entry.openCases,
      dueSoonCount: entry.dueSoonCount,
    }))
    .sort(
      (a, b) =>
        b.openCases - a.openCases ||
        b.averageRiskScore - a.averageRiskScore ||
        b.dueSoonCount - a.dueSoonCount
    )
    .slice(0, 4)
  const maintenanceFocusArea = maintenancePressure[0]?.label ?? highestRiskCategory

  return {
    summary: {
      highRiskAssets: highRiskAssets.length,
      mediumRiskAssets: mediumRiskAssets.length,
      predictedMaintenanceNext90Days,
      openMaintenanceCases,
      overdueAttentionAssets,
      preventiveCoveragePercent,
      averageRiskScore,
    },
    trends: {
      highestRiskType,
      highestRiskCategory,
      recentMaintenanceLoad,
      unresolvedRate,
      replacementExposure,
      maintenanceFocusArea,
    },
    recommendations: buildRecommendations({
      highRiskAssetCount: highRiskAssets.length,
      criticalRiskAssetCount: criticalRiskAssets.length,
      mediumRiskAssetCount: mediumRiskAssets.length,
      highestRiskType,
      highestRiskCategory,
      predictedMaintenanceNext90Days,
      recentMaintenanceLoad,
      overdueAttentionAssets,
      preventiveCoveragePercent,
      maintenanceFocusArea,
      openMaintenanceCases,
    }),
    riskDistribution: {
      low: scoredAssets.filter(asset => asset.riskScore < 35).length,
      medium: mediumRiskAssets.length,
      high: highRiskAssets.filter(asset => asset.riskScore < 80).length,
      critical: criticalRiskAssets.length,
    },
    maintenancePressure,
    highRiskAssets: highRiskAssets.slice(0, 5).map(asset => ({
      id: asset.id,
      assetNo: asset.assetNo,
      assetName: asset.assetName,
      type: asset.type,
      category: asset.category,
      ageYears: asset.ageYears,
      riskScore: asset.riskScore,
      maintenanceCount: asset.maintenanceCount,
      openCases: asset.openCases,
      lastMaintenanceAt: asset.lastMaintenanceAt,
      nextServiceDate: asset.nextServiceDate,
      maintenanceMode: asset.maintenanceMode,
      suggestedAction: asset.suggestedAction,
    })),
  }
}

function buildRecommendations({
  highRiskAssetCount,
  criticalRiskAssetCount,
  mediumRiskAssetCount,
  highestRiskType,
  highestRiskCategory,
  predictedMaintenanceNext90Days,
  recentMaintenanceLoad,
  overdueAttentionAssets,
  preventiveCoveragePercent,
  maintenanceFocusArea,
  openMaintenanceCases,
}: {
  highRiskAssetCount: number
  criticalRiskAssetCount: number
  mediumRiskAssetCount: number
  highestRiskType: string
  highestRiskCategory: string
  predictedMaintenanceNext90Days: number
  recentMaintenanceLoad: number
  overdueAttentionAssets: number
  preventiveCoveragePercent: number
  maintenanceFocusArea: string
  openMaintenanceCases: number
}) {
  const recommendations: CustomAssetReportResponse['insights']['recommendations'] = []

  if (criticalRiskAssetCount > 0) {
    recommendations.push({
      title: 'Escalate critical replacement review',
      detail: `${criticalRiskAssetCount} assets are now in the critical-risk band. Start technical review and replacement justification for the oldest units with repeated failures.`,
      priority: 'High',
      owner: 'Admin',
      confidence: 'High',
    })
  }

  if (overdueAttentionAssets > 0) {
    recommendations.push({
      title: 'Clear overdue maintenance backlog',
      detail: `${overdueAttentionAssets} assets already require overdue attention. Triage the ${maintenanceFocusArea.toLowerCase()} area first to reduce service disruption risk.`,
      priority: 'High',
      owner: 'Maintenance Team',
      confidence: 'High',
    })
  }

  if (predictedMaintenanceNext90Days > 0) {
    recommendations.push({
      title: 'Prepare the next 90-day maintenance load',
      detail: `Expected maintenance demand is around ${predictedMaintenanceNext90Days} cases. Reserve support capacity for ${highestRiskType.toLowerCase()} assets before the next quarter closes.`,
      priority: highRiskAssetCount > 0 ? 'High' : 'Medium',
      owner: 'Admin Assistant',
      confidence: highRiskAssetCount > 0 ? 'High' : 'Medium',
    })
  }

  if (preventiveCoveragePercent < 70) {
    recommendations.push({
      title: 'Expand preventive maintenance coverage',
      detail: `Only ${preventiveCoveragePercent}% of filtered assets have preventive maintenance enabled. Prioritize the ${highestRiskCategory.toLowerCase()} category to reduce reactive cases.`,
      priority: 'Medium',
      owner: 'Asset Admin',
      confidence: 'Medium',
    })
  }

  if (mediumRiskAssetCount > 0 && openMaintenanceCases > 0) {
    recommendations.push({
      title: 'Convert repeated issues into inspection actions',
      detail: `${mediumRiskAssetCount} assets remain in the medium-risk band with ${openMaintenanceCases} open cases. Schedule targeted inspection rounds for ${maintenanceFocusArea.toLowerCase()} assets.`,
      priority: 'Medium',
      owner: 'Maintenance Team',
      confidence: 'Medium',
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Continue routine monitoring',
      detail: `No immediate risk cluster was detected. Keep monitoring and review again if maintenance activity rises above ${recentMaintenanceLoad} recent cases in the current filter scope.`,
      priority: 'Low',
      owner: 'Admin',
      confidence: 'Low',
    })
  }

  return recommendations.slice(0, 4)
}

function parseDate(value?: string | null) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getAgeInYears(asset: AssetRow) {
  const assetDate = parseDate(asset.purchase_date ?? asset.created_at ?? null)
  if (!assetDate) {
    return 0
  }

  const ageInYears =
    (Date.now() - assetDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return Number(Math.max(0, ageInYears).toFixed(1))
}

function normalizeCurrencyNumber(value: number | string | null | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function getSuggestedAction(
  riskScore: number,
  ageYears: number,
  maintenanceCount: number,
  openCases: number,
  nextServiceDelta: number | null
) {
  if (
    riskScore >= 80 ||
    openCases >= 2 ||
    (nextServiceDelta !== null && nextServiceDelta < 0)
  ) {
    return 'Plan replacement'
  }

  if (riskScore >= 60 || (ageYears >= 5 && maintenanceCount >= 2)) {
    return 'Schedule immediate service'
  }

  if (riskScore >= 35) {
    return 'Run preventive inspection'
  }

  return 'Routine review'
}

function normalizeMaintenanceMode(value?: string | null) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'preventive') return 'Preventive'
  if (normalized === 'predictive') return 'Predictive'
  if (normalized === 'hybrid') return 'Hybrid'
  return 'Corrective'
}

function getDaysUntilDate(date: Date, todayUtc: number) {
  const dueUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  )
  return Math.floor((dueUtc - todayUtc) / 86400000)
}

function getTopCountLabel(counts: Map<string, number>) {
  const topEntry = Array.from(counts.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  )[0]

  return topEntry?.[0] ?? 'No data'
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function createExcelBorder() {
  return {
    top: { style: 'thin' as const, color: { argb: 'FFD7E2EE' } },
    left: { style: 'thin' as const, color: { argb: 'FFD7E2EE' } },
    bottom: { style: 'thin' as const, color: { argb: 'FFD7E2EE' } },
    right: { style: 'thin' as const, color: { argb: 'FFD7E2EE' } },
  }
}

type ExcelStyleCell = {
  font?: unknown
  fill?: unknown
  border?: unknown
  value?: unknown
}

type ExcelStyleRow = {
  eachCell: unknown
}

type ExcelWritableRow = {
  getCell: (index: number) => ExcelStyleCell
}

type ExcelWritableSheet = {
  getRow: (row: number) => ExcelWritableRow
}

function styleExcelHeaderRow(row: ExcelStyleRow) {
  ;(
    row.eachCell as (callback: (cell: ExcelStyleCell) => void) => void
  )(cell => {
    cell.font = { bold: true, color: { argb: 'FF0F172A' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEAF4FF' },
    }
    cell.border = createExcelBorder()
  })
}

function writeExcelSection(
  sheet: ExcelWritableSheet,
  startRow: number,
  title: string,
  rows: Array<Array<string | number>>
) {
  const titleRow = sheet.getRow(startRow)
  titleRow.getCell(1).value = title
  titleRow.getCell(1).font = {
    bold: true,
    size: 12,
    color: { argb: 'FF0F172A' },
  }

  rows.forEach((rowValues, index) => {
    const row = sheet.getRow(startRow + 1 + index)
    rowValues.forEach((value, cellIndex) => {
      const cell = row.getCell(cellIndex + 1)
      cell.value = value
      cell.border = createExcelBorder()
      if (index === 0) {
        cell.font = { bold: true, color: { argb: 'FF0F172A' } }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEAF4FF' },
        }
      }
    })
  })

  return startRow + rows.length + 1
}
