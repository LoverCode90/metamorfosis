"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { DbOrder } from "@/lib/orders/types"
import { useReturnEligibility } from "@/hooks/use-return-eligibility"
import { TrackingEmptyState } from "./tracking-empty-state"
import { TrackingOrderHeader } from "./tracking-order-header"
import { TrackingStages } from "./tracking-stages"
import { TrackingItems } from "./tracking-items"

interface TrackingViewProps {
  order: DbOrder | null
}

export function TrackingView({ order }: TrackingViewProps) {
  const router = useRouter()
  const canReportProblem = useReturnEligibility(order)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <button
        type="button"
        onClick={() => router.push("/orders")}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to orders
      </button>

      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          My Account
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Order Tracking
        </h1>
      </div>

      {!order ? (
        <TrackingEmptyState />
      ) : (
        <>
          <TrackingOrderHeader order={order} />
          <TrackingStages order={order} />
          <TrackingItems order={order} canReportProblem={canReportProblem} />
        </>
      )}
    </div>
  )
}
