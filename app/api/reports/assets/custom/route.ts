import { NextResponse } from 'next/server'
import { renderAssetReportPrintDocument } from '@/components/reports/AssetReportPrintDocument'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import {
  buildCustomAssetReport,
  buildCustomAssetReportExcel,
  sanitizeAssetReportFilters,
} from '@/lib/customAssetReport'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin' && profile?.role !== 'admin_assistant') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(request.url)
  const filters = sanitizeAssetReportFilters({
    assetTypes: url.searchParams.getAll('assetType'),
    categoryIds: url.searchParams.getAll('categoryId'),
    period: url.searchParams.get('period'),
    startDate: url.searchParams.get('startDate'),
    endDate: url.searchParams.get('endDate'),
  })

  try {
    const report = await buildCustomAssetReport(supabase, filters)
    const format = url.searchParams.get('format')

    if (format === 'excel') {
      const workbook = await buildCustomAssetReportExcel(report)
      return new NextResponse(workbook, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition':
            'attachment; filename="custom-asset-report.xlsx"',
        },
      })
    }

    if (format === 'print') {
      const markup = renderAssetReportPrintDocument(report)

      return new NextResponse(markup, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate report',
      },
      { status: 500 }
    )
  }
}
