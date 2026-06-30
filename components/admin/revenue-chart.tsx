"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

import { formatUSD } from "@/lib/utils/format"
import type { DailyRevenue } from "@/lib/admin/daily-revenue"

interface TooltipEntry {
  payload: DailyRevenue
}

/** shadcn-styled tooltip card shown on bar hover. */
function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipEntry[]
}) {
  if (!active || !payload?.length) return null
  const day = payload[0].payload
  return (
    <div className="border-border bg-background rounded-lg border px-3 py-2 shadow-md">
      <p className="text-muted-foreground text-xs">{day.label}</p>
      <p className="text-foreground text-sm font-semibold">
        {formatUSD(day.revenueCents)}
      </p>
    </div>
  )
}

/**
 * Revenue for the last 7 days as an interactive recharts bar chart. Data is
 * computed server-side in {@link buildDailyRevenue}; this client component only
 * renders it with hover tooltips.
 */
export function RevenueChart({ data }: { data: DailyRevenue[] }) {
  const weekTotal = data.reduce((sum, day) => sum + day.revenueCents, 0)

  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-foreground text-base font-semibold">Revenue</h2>
          <p className="text-muted-foreground text-xs">Last 7 days</p>
        </div>
        <p className="text-foreground text-lg font-semibold">
          {formatUSD(weekTotal)}
        </p>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="0"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
              content={<RevenueTooltip />}
            />
            <Bar
              dataKey="revenueCents"
              fill="var(--color-accent-violet)"
              radius={[6, 6, 0, 0]}
              maxBarSize={56}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
