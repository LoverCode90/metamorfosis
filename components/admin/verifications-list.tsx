"use client"

import { VerificationDetail } from "@/components/admin/verification-detail"
import { VerificationDetailSheet } from "@/components/admin/verification-detail-sheet"
import { VerificationListPanel } from "@/components/admin/verification-list-panel"
import { useVerifications } from "@/hooks/use-verifications"

/**
 * Admin dashboard for reviewing professional/student verification requests.
 * Two-pane on desktop (list + detail) and a bottom sheet for the detail on
 * smaller screens. All data and mutations come from {@link useVerifications}.
 */
export function VerificationsDashboard() {
  const v = useVerifications()

  return (
    <div className="flex h-full min-h-0 gap-6">
      <VerificationListPanel
        filter={v.filter}
        onFilterChange={v.setFilter}
        items={v.items}
        selectedId={v.selected?.id ?? null}
        onSelect={v.setSelected}
        isLoading={v.isLoading}
        isLoadingMore={v.isLoadingMore}
        hasMore={v.hasMore}
        onRefresh={v.refresh}
        onLoadMore={v.loadMore}
      />

      <div className="hidden flex-1 lg:block">
        {v.selected ? (
          <VerificationDetail
            item={v.selected}
            onApprove={v.approve}
            onReject={v.reject}
          />
        ) : (
          <div className="border-border text-muted-foreground flex h-64 items-center justify-center rounded-xl border border-dashed text-sm">
            Select a verification to review
          </div>
        )}
      </div>

      <VerificationDetailSheet
        item={v.selected}
        onClose={() => v.setSelected(null)}
        onApprove={v.approve}
        onReject={v.reject}
      />
    </div>
  )
}
