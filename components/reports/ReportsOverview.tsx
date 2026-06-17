import { createSupabaseServerClient } from '@/lib/supabaseServer'
import {
  buildCustomAssetReport,
  getAssetReportFilterOptions,
  getDefaultAssetReportFilters,
} from '@/lib/customAssetReport'
import { ReportsDashboard } from '@/components/reports/ReportsDashboard'

export async function ReportsOverview() {
  const supabase = await createSupabaseServerClient()
  const initialFilters = getDefaultAssetReportFilters('three-year')
  const [filterOptions, initialReport] = await Promise.all([
    getAssetReportFilterOptions(supabase),
    buildCustomAssetReport(supabase, initialFilters),
  ])

  return (
    <div className="space-y-6 p-1">
      <ReportsDashboard
        categoryOptions={filterOptions.categoryOptions}
        initialFilters={initialFilters}
        initialReport={initialReport}
      />
    </div>
  )
}
