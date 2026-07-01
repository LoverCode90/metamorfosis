import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { CaseDetailsSection } from "@/components/profile/case-details-section"
import { CaseTimeline } from "@/components/profile/case-timeline"
import type { DbCase } from "@/lib/cases/types"

/** Customer view of a support case: details and status timeline. */
export function CaseTrackingView({ caseData }: { caseData: DbCase }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/orders"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to orders
      </Link>

      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          Case Support
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Return / Issue #{caseData.id.slice(0, 8).toUpperCase()}
        </h1>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <CaseDetailsSection caseData={caseData} />
        </div>
        <div className="space-y-6">
          <CaseTimeline
            createdAt={caseData.created_at}
            resolvedAt={caseData.resolved_at}
          />
        </div>
      </div>
    </div>
  )
}
