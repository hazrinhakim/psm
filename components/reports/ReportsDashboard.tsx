'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

let chartRegistered = false

if (!chartRegistered) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend
  )
  chartRegistered = true
}

import * as React from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ChartPayload = {
  labels: string[]
  data: number[]
}

type ReportsDashboardProps = {
  metrics: {
    totalAssets: number
    totalRequests: number
    pendingRequests: number
    inProgressRequests: number
    completedRequests: number
  }
  charts: {
    category: ChartPayload
    type: ChartPayload
    status: ChartPayload
    maintenanceTrend: ChartPayload
  }
  insights: string[]
}

export function ReportsDashboard({
  metrics,
  charts,
  insights,
}: ReportsDashboardProps) {

  /* ---------- MEMOIZED CHART CONFIGS ---------- */

  const maintenanceTrendData = React.useMemo(() => ({
    labels: charts.maintenanceTrend.labels,
    datasets: [
      {
        label: 'Requests',
        data: charts.maintenanceTrend.data,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.35,
      },
    ],
  }), [charts.maintenanceTrend])

  const doughnutData = React.useMemo(() => ({
    labels: charts.status.labels,
    datasets: [
      {
        data: charts.status.data,
        backgroundColor: [
          '#f97316',
          '#3b82f6',
          '#22c55e',
          '#94a3b8',
        ],
        borderWidth: 1,
      },
    ],
  }), [charts.status])

  const barCategoryData = React.useMemo(() => ({
    labels: charts.category.labels,
    datasets: [
      {
        label: 'Assets',
        data: charts.category.data,
        backgroundColor: 'rgba(14, 116, 144, 0.6)',
      },
    ],
  }), [charts.category])

  const barTypeData = React.useMemo(() => ({
    labels: charts.type.labels,
    datasets: [
      {
        label: 'Assets',
        data: charts.type.data,
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
      },
    ],
  }), [charts.type])

  const baseOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
  }), [])

  /* ---------- UI ---------- */

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Total assets', metrics.totalAssets],
          ['Maintenance requests', metrics.totalRequests],
          ['Pending', metrics.pendingRequests],
          ['In progress', metrics.inProgressRequests],
          ['Completed', metrics.completedRequests],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">
                {value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Maintenance trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <Line
              data={maintenanceTrendData}
              options={{
                ...baseOptions,
                plugins: { legend: { display: false } },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance status</CardTitle>
            <CardDescription>Request breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <Doughnut
              data={doughnutData}
              options={{
                ...baseOptions,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asset distribution</CardTitle>
            <CardDescription>Assets by category</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <Bar
              data={barCategoryData}
              options={{
                ...baseOptions,
                plugins: { legend: { display: false } },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset usage</CardTitle>
            <CardDescription>Assets by type</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <Bar
              data={barTypeData}
              options={{
                ...baseOptions,
                plugins: { legend: { display: false } },
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI insights</CardTitle>
            <CardDescription>
              Automated recommendations based on current data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {insights.length === 0
              ? <p>No insights yet. Keep collecting data.</p>
              : insights.map((i, idx) => <p key={idx}>• {i}</p>)
            }
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
