import type { CustomAssetReportResponse } from '@/lib/customAssetReport'

type PrintRow = {
  label: string
  value: number
}

export function renderAssetReportPrintDocument(
  report: CustomAssetReportResponse
) {
  const generatedAtLabel = new Date(report.meta.generatedAt).toLocaleString(
    'en-US'
  )
  const timelineRows = report.charts.timeline.labels.map((label, index) => ({
    label,
    value: report.charts.timeline.data[index] ?? 0,
  }))
  const typeRows = report.charts.typeDistribution.labels.map((label, index) => ({
    label,
    value: report.charts.typeDistribution.data[index] ?? 0,
  }))
  const categoryRows = report.charts.categoryDistribution.labels.map(
    (label, index) => ({
      label,
      value: report.charts.categoryDistribution.data[index] ?? 0,
    })
  )
  const topType = typeRows[0]
  const topCategory = categoryRows[0]
  const topHighRiskAssets = report.insights.highRiskAssets.slice(0, 5)
  const peakTimeline = timelineRows.reduce<PrintRow | null>((best, row) => {
    if (!best || row.value > best.value) {
      return row
    }

    return best
  }, null)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Custom Asset Report</title>
    <style>
      :root {
        --ink: #0f172a;
        --muted: #475569;
        --border: #dbe4f0;
        --panel: #f8fafc;
        --panel-strong: #e2e8f0;
        --accent: #0f766e;
        --accent-alt: #2563eb;
        --accent-warm: #d97706;
      }

      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        font-family: "Segoe UI", Arial, sans-serif;
        color: var(--ink);
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .page {
        width: 100%;
        max-width: 1120px;
        margin: 0 auto;
        padding: 36px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: flex-start;
        border-bottom: 2px solid var(--panel-strong);
        padding-bottom: 20px;
      }

      .brand {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 14px;
      }

      .brand-mark {
        width: 64px;
        height: 64px;
        object-fit: contain;
        border-radius: 18px;
        padding: 8px;
        border: 1px solid var(--border);
        background: white;
      }

      .brand-copy { min-width: 0; }
      .brand-name {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        line-height: 1.15;
      }

      .brand-subtitle {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: 13px;
      }

      .eyebrow {
        margin: 0 0 8px;
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        font-size: 30px;
        line-height: 1.1;
      }

      .lede {
        margin: 10px 0 0;
        color: var(--muted);
        max-width: 640px;
        font-size: 14px;
        line-height: 1.6;
      }

      .meta {
        min-width: 240px;
        padding: 18px;
        border: 1px solid var(--border);
        border-radius: 18px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      }

      .meta-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border);
        font-size: 13px;
      }

      .meta-row:last-child { border-bottom: 0; padding-bottom: 0; }
      .meta-row:first-child { padding-top: 0; }
      .meta-label { color: var(--muted); }
      .meta-value { font-weight: 600; text-align: right; }

      .section {
        margin-top: 28px;
        break-inside: avoid;
      }

      .section-title {
        margin: 0 0 14px;
        font-size: 18px;
        font-weight: 700;
      }

      .section-note {
        margin: -4px 0 16px;
        color: var(--muted);
        font-size: 13px;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .summary-card {
        padding: 18px;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      }

      .summary-label {
        color: var(--muted);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .summary-value {
        margin-top: 10px;
        font-size: 26px;
        font-weight: 700;
      }

      .summary-help {
        margin-top: 8px;
        color: var(--muted);
        font-size: 13px;
      }

      .highlight-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .highlight {
        padding: 18px;
        border-radius: 18px;
        border: 1px solid var(--border);
        background:
          radial-gradient(circle at top right, rgba(37, 99, 235, 0.1), transparent 42%),
          linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      }

      .highlight.warm {
        background:
          radial-gradient(circle at top right, rgba(245, 158, 11, 0.14), transparent 42%),
          linear-gradient(180deg, #ffffff 0%, #fffaf0 100%);
      }

      .highlight.cool {
        background:
          radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 42%),
          linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%);
      }

      .highlight-label {
        margin: 0;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .highlight-value {
        margin: 10px 0 6px;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.2;
      }

      .highlight-note {
        margin: 0;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.55;
      }

      .forecast-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 14px;
      }

      .stack {
        display: grid;
        gap: 14px;
      }

      .recommendation-list,
      .risk-list {
        display: grid;
        gap: 12px;
      }

      .recommendation,
      .risk-card {
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 14px;
        background: white;
      }

      .recommendation-top,
      .risk-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
      }

      .recommendation-title,
      .risk-name {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
      }

      .recommendation-detail,
      .risk-meta {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.55;
      }

      .pill {
        flex-shrink: 0;
        padding: 5px 9px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .pill.high {
        background: #fee2e2;
        color: #b91c1c;
      }

      .pill.medium {
        background: #fef3c7;
        color: #b45309;
      }

      .pill.low {
        background: #e2e8f0;
        color: #475569;
      }

      .risk-score {
        flex-shrink: 0;
        padding: 5px 9px;
        border-radius: 999px;
        background: #fee2e2;
        color: #b91c1c;
        font-size: 11px;
        font-weight: 700;
      }

      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }

      .chip {
        padding: 5px 9px;
        border-radius: 999px;
        background: var(--panel);
        font-size: 12px;
        color: var(--muted);
      }

      .chip.action {
        background: #dbeafe;
        color: #1d4ed8;
      }

      .chart-grid {
        display: grid;
        grid-template-columns: 1.35fr 1fr 1fr;
        gap: 14px;
      }

      .panel {
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 18px;
        background: var(--panel);
      }

      .panel h3 {
        margin: 0 0 14px;
        font-size: 15px;
      }

      .list {
        display: grid;
        gap: 12px;
      }

      .bar-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 64px;
        gap: 12px;
        align-items: center;
      }

      .bar-copy { min-width: 0; }

      .bar-label {
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 6px;
      }

      .bar-track {
        height: 10px;
        border-radius: 999px;
        background: white;
        overflow: hidden;
        border: 1px solid var(--border);
      }

      .bar-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent-alt), var(--accent));
      }

      .bar-fill.warm {
        background: linear-gradient(90deg, #f59e0b, var(--accent-warm));
      }

      .bar-value {
        text-align: right;
        font-size: 13px;
        font-weight: 600;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid var(--border);
        border-radius: 18px;
        overflow: hidden;
      }

      thead th {
        background: #eaf4ff;
        color: #0f172a;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      th, td {
        padding: 12px 14px;
        text-align: left;
        border-bottom: 1px solid var(--border);
        font-size: 13px;
      }

      tbody tr:nth-child(even) td {
        background: #fbfdff;
      }

      tbody tr:last-child td {
        border-bottom: 0;
      }

      .numeric {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      .footer {
        margin-top: 24px;
        color: var(--muted);
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        border-top: 1px solid var(--border);
        padding-top: 14px;
      }

      @media print {
        @page {
          size: A4;
          margin: 14mm;
        }

        .page {
          max-width: none;
          padding: 0;
        }
      }

      @media screen {
        body {
          background: #e2e8f0;
          padding: 24px;
        }

        .page {
          background: white;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
          border-radius: 24px;
        }
      }

      @media (max-width: 960px) {
        .header,
        .chart-grid,
        .summary-grid,
        .highlight-grid,
        .forecast-grid {
          grid-template-columns: 1fr;
          display: grid;
        }

        .header { display: grid; }
        .meta { min-width: 0; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="header">
        <div>
          <div class="brand">
            <img class="brand-mark" src="/ICAMS-1.png" alt="ICAMS logo" />
            <div class="brand-copy">
              <p class="brand-name">Integrated Campus Asset Management System</p>
              <p class="brand-subtitle">Administrative reporting export for asset distribution and activity trends</p>
            </div>
          </div>
          <p class="eyebrow">Asset Analytics Report</p>
          <h1>Custom Asset Report</h1>
          <p class="lede">Asset distribution across the selected reporting window, with timeline trends, type and category breakdowns, and a detailed type-to-category distribution table.</p>
        </div>
        <div class="meta">
          <div class="meta-row">
            <span class="meta-label">Period</span>
            <span class="meta-value">${escapeHtml(report.meta.periodLabel)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Date Range</span>
            <span class="meta-value">${escapeHtml(report.meta.startLabel)} - ${escapeHtml(report.meta.endLabel)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Asset Types</span>
            <span class="meta-value">${escapeHtml(
              report.filters.assetTypes.length > 0
                ? `${report.filters.assetTypes.length} selected`
                : 'All'
            )}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Generated</span>
            <span class="meta-value">${escapeHtml(generatedAtLabel)}</span>
          </div>
        </div>
      </header>

      <section class="section">
        <h2 class="section-title">Executive Summary</h2>
        <div class="summary-grid">
          ${renderSummaryCard(
            'Filtered Assets',
            report.summary.totalAssets,
            'Assets inside the selected reporting window'
          )}
          ${renderSummaryCard(
            'Asset Types',
            report.summary.totalTypes,
            'Distinct type groups in the filtered result'
          )}
          ${renderSummaryCard(
            'Categories',
            report.summary.totalCategories,
            'Distinct category groups in the filtered result'
          )}
          ${renderSummaryCard(
            'Average / Bucket',
            report.summary.averagePerBucket,
            'Average assets per timeline bucket'
          )}
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Key Highlights</h2>
        <div class="highlight-grid">
          <div class="highlight cool">
            <p class="highlight-label">Top Asset Type</p>
            <p class="highlight-value">${escapeHtml(topType?.label ?? 'No data')}</p>
            <p class="highlight-note">${escapeHtml(
              topType
                ? `${topType.value} assets in the strongest type group.`
                : 'No asset type data is available for this filter set.'
            )}</p>
          </div>
          <div class="highlight warm">
            <p class="highlight-label">Top Category</p>
            <p class="highlight-value">${escapeHtml(topCategory?.label ?? 'No data')}</p>
            <p class="highlight-note">${escapeHtml(
              topCategory
                ? `${topCategory.value} assets in the strongest category group.`
                : 'No category data is available for this filter set.'
            )}</p>
          </div>
          <div class="highlight">
            <p class="highlight-label">Peak Timeline Bucket</p>
            <p class="highlight-value">${escapeHtml(peakTimeline?.label ?? 'No data')}</p>
            <p class="highlight-note">${escapeHtml(
              peakTimeline
                ? `${peakTimeline.value} assets recorded in the busiest period bucket.`
                : 'No timeline trend is available for this filter set.'
            )}</p>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Distribution Overview</h2>
        <p class="section-note">This section highlights the trendline buckets and the strongest distribution groups inside the current filter scope.</p>
        <div class="chart-grid">
          <div class="panel">
            <h3>Timeline Breakdown</h3>
            <div class="list">
              ${timelineRows
                .map(row =>
                  renderBarRow(
                    row,
                    Math.max(...report.charts.timeline.data, 1)
                  )
                )
                .join('')}
            </div>
          </div>
          <div class="panel">
            <h3>Asset Count by Type</h3>
            <div class="list">
              ${
                typeRows.length > 0
                  ? typeRows
                      .map(row =>
                        renderBarRow(
                          row,
                          Math.max(...report.charts.typeDistribution.data, 1)
                        )
                      )
                      .join('')
                  : renderEmptyState()
              }
            </div>
          </div>
          <div class="panel">
            <h3>Asset Count by Category</h3>
            <div class="list">
              ${
                categoryRows.length > 0
                  ? categoryRows
                      .map(row =>
                        renderBarRow(
                          row,
                          Math.max(...report.charts.categoryDistribution.data, 1),
                          'warm'
                        )
                      )
                      .join('')
                  : renderEmptyState()
              }
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Predictions & Recommendations</h2>
        <p class="section-note">Forward-looking asset risk scoring based on asset age and maintenance history in the current filtered scope.</p>
        <div class="summary-grid">
          ${renderSummaryCard(
            'High Risk Assets',
            report.insights.summary.highRiskAssets,
            'Immediate review candidates'
          )}
          ${renderSummaryCard(
            'Medium Risk Assets',
            report.insights.summary.mediumRiskAssets,
            'Preventive action recommended'
          )}
          ${renderSummaryCard(
            'Predicted Maintenance',
            report.insights.summary.predictedMaintenanceNext90Days,
            'Estimated cases in the next 90 days'
          )}
        </div>
        <div class="forecast-grid" style="margin-top: 14px;">
          <div class="stack">
            <div class="panel">
              <h3>Recommended Actions</h3>
              <div class="recommendation-list">
                ${report.insights.recommendations
                  .map(
                    item => `<div class="recommendation">
                  <div class="recommendation-top">
                    <div>
                      <p class="recommendation-title">${escapeHtml(item.title)}</p>
                      <p class="recommendation-detail">${escapeHtml(item.detail)}</p>
                    </div>
                    <span class="pill ${escapeHtml(item.priority)}">${escapeHtml(item.priority)}</span>
                  </div>
                </div>`
                  )
                  .join('')}
              </div>
            </div>
          </div>
          <div class="stack">
            <div class="panel">
              <h3>Risk Trends</h3>
              <div class="list">
                ${renderBarRow(
                  {
                    label: `Highest Risk Type: ${report.insights.trends.highestRiskType}`,
                    value: report.insights.summary.highRiskAssets,
                  },
                  Math.max(report.insights.summary.highRiskAssets, 1)
                )}
                ${renderBarRow(
                  {
                    label: `Recent Maintenance Load: ${report.insights.trends.recentMaintenanceLoad} cases`,
                    value: report.insights.trends.recentMaintenanceLoad,
                  },
                  Math.max(report.insights.trends.recentMaintenanceLoad, 1),
                  'warm'
                )}
              </div>
              <p class="section-note" style="margin: 14px 0 0;">Highest risk category: ${escapeHtml(report.insights.trends.highestRiskCategory)}</p>
            </div>
            <div class="panel">
              <h3>High-risk Assets</h3>
              <div class="risk-list">
                ${
                  topHighRiskAssets.length > 0
                    ? topHighRiskAssets
                        .map(
                          asset => `<div class="risk-card">
                    <div class="risk-top">
                      <div>
                        <p class="risk-name">${escapeHtml(asset.assetName)}</p>
                        <p class="risk-meta">${escapeHtml(asset.assetNo)} · ${escapeHtml(asset.type)} · ${escapeHtml(asset.category)}</p>
                      </div>
                      <span class="risk-score">${asset.riskScore}</span>
                    </div>
                    <div class="chip-row">
                      <span class="chip">Age ${asset.ageYears} yrs</span>
                      <span class="chip">${asset.maintenanceCount} maintenance cases</span>
                      <span class="chip action">${escapeHtml(asset.suggestedAction)}</span>
                    </div>
                  </div>`
                        )
                        .join('')
                    : renderEmptyState()
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Detailed Distribution</h2>
        <p class="section-note">Type and category combinations ranked by matching asset count.</p>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Category</th>
              <th class="numeric">Count</th>
              <th class="numeric">Share</th>
            </tr>
          </thead>
          <tbody>
            ${report.table
              .map(
                row => `<tr>
              <td>${escapeHtml(row.type)}</td>
              <td>${escapeHtml(row.category)}</td>
              <td class="numeric">${row.count}</td>
              <td class="numeric">${row.share}%</td>
            </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </section>

      <div class="footer">
        <span>ICAMS reporting export</span>
        <span>Generated on ${escapeHtml(generatedAtLabel)}</span>
      </div>
    </div>
    <script>
      window.addEventListener('load', () => window.setTimeout(() => window.print(), 180));
    </script>
  </body>
</html>`
}

function renderSummaryCard(
  label: string,
  value: number | string,
  helper: string
) {
  return `<div class="summary-card">
    <div class="summary-label">${escapeHtml(label)}</div>
    <div class="summary-value">${value}</div>
    <div class="summary-help">${escapeHtml(helper)}</div>
  </div>`
}

function renderBarRow(row: PrintRow, max: number, tone?: 'warm') {
  const width =
    max > 0
      ? `${Math.max((row.value / max) * 100, row.value > 0 ? 10 : 0)}%`
      : '0%'

  return `<div class="bar-row">
    <div class="bar-copy">
      <div class="bar-label">${escapeHtml(row.label)}</div>
      <div class="bar-track">
        <div class="bar-fill${tone === 'warm' ? ' warm' : ''}" style="width: ${width}"></div>
      </div>
    </div>
    <div class="bar-value">${row.value}</div>
  </div>`
}

function renderEmptyState() {
  return '<p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6;">No data available for the selected filters.</p>'
}


function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
