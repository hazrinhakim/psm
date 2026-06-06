'use client'

import * as React from 'react'
import { Cell, Label, Pie, PieChart } from 'recharts'
import { Power, Wrench, Zap } from 'lucide-react'
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

type AssetStatusOverviewProps = {
  active: number
  maintenance: number
  inactive: number
}

const chartConfig = {
  active: {
    label: 'Active',
    color: '#0ae098',
  },
  maintenance: {
    label: 'Under Maintenance',
    color: '#f59e0b',
  },
  inactive: {
    label: 'Inactive',
    color: '#94a3b8',
  },
} satisfies ChartConfig

type StatusDatum = {
  key: keyof typeof chartConfig
  label: string
  value: number
  percent: number
  color: string
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
  bgClass: string
}

type PieLabelProps = {
  cx?: number
  cy?: number
  midAngle?: number
  outerRadius?: number
  value?: number | string
}

function SliceValueLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  value,
}: PieLabelProps) {
  const RADIAN = Math.PI / 180
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const startX = cx + (outerRadius + 4) * cos
  const startY = cy + (outerRadius + 4) * sin
  const midX = cx + (outerRadius + 20) * cos
  const midY = cy + (outerRadius + 20) * sin
  const endX = midX + (cos >= 0 ? 18 : -18)
  const endY = midY
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <path
        d={`M ${startX} ${startY} L ${midX} ${midY} L ${endX} ${endY}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-muted-foreground/70"
      />
      <text
        x={endX + (cos >= 0 ? 4 : -4)}
        y={endY}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="fill-foreground text-[11px] font-semibold sm:text-xs"
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </text>
    </g>
  )
}

export function AssetStatusOverview({
  active,
  maintenance,
  inactive,
}: AssetStatusOverviewProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const total = Math.max(active + maintenance + inactive, 0)

  const data = React.useMemo<StatusDatum[]>(
    () => {
      const rows = [
        {
          key: 'active',
          label: 'Active',
          value: active,
          color: 'var(--color-active)',
          icon: Zap,
          iconClass: 'text-emerald-600 dark:text-emerald-300',
          bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
        },
        {
          key: 'maintenance',
          label: 'Under Maintenance',
          value: maintenance,
          color: 'var(--color-maintenance)',
          icon: Wrench,
          iconClass: 'text-amber-600 dark:text-amber-300',
          bgClass: 'bg-amber-50 dark:bg-amber-500/10',
        },
        {
          key: 'inactive',
          label: 'Inactive',
          value: inactive,
          color: 'var(--color-inactive)',
          icon: Power,
          iconClass: 'text-slate-600 dark:text-slate-300',
          bgClass: 'bg-slate-100 dark:bg-slate-500/10',
        },
      ] as const

      return rows.map(row => ({
        ...row,
        percent: total > 0 ? Math.round((row.value / total) * 100) : 0,
      }))
    },
    [active, inactive, maintenance, total]
  )

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">
            Asset Status Overview
          </CardTitle>
          <CardDescription>
            Current asset activity snapshot
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="relative px-2">
            <div className="pointer-events-none absolute inset-x-6 top-4 h-28 rounded-full bg-emerald-500/10 blur-3xl" />
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[300px] sm:h-[340px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <>
                          <span className="text-muted-foreground">{name}</span>
                          <span className="font-mono font-medium text-foreground">
                            {Number(value).toLocaleString()} assets
                          </span>
                        </>
                      )}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={76}
                  outerRadius={104}
                  paddingAngle={4}
                  cornerRadius={10}
                  strokeWidth={0}
                  animationBegin={100}
                  animationDuration={850}
                  animationEasing="ease-out"
                  labelLine={false}
                  label={<SliceValueLabel />}
                  activeIndex={activeIndex ?? undefined}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (
                        !viewBox ||
                        !('cx' in viewBox) ||
                        !('cy' in viewBox) ||
                        typeof viewBox.cx !== 'number' ||
                        typeof viewBox.cy !== 'number'
                      ) {
                        return null
                      }

                      const activeItem =
                        activeIndex !== null ? data[activeIndex] : null

                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy - 6}
                            className="fill-foreground text-3xl font-semibold"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy + 18}
                            className="fill-muted-foreground text-xs"
                          >
                            {activeItem
                              ? `${activeItem.label} · ${activeItem.percent}%`
                              : 'total assets'}
                          </tspan>
                        </text>
                      )
                    }}
                  />
                  {data.map(item => (
                    <Cell key={item.key} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Hover a chart segment to view its status details.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
