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
  const {
    filter,
    setFilter,
    items,
    selected: selectedVerification,
    setSelected,
    isLoading,
    isLoadingMore,
    hasMore,
    refresh,
    loadMore,
    approve,
    reject,
  } = useVerifications()

  return (
    <div className="flex h-full min-h-0 gap-6">
      <VerificationListPanel
        filter={filter}
        onFilterChange={setFilter}
        items={items}
        selectedId={selectedVerification?.id ?? null}
        onSelect={setSelected}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onRefresh={refresh}
        onLoadMore={loadMore}
      />

      <div className="hidden flex-1 lg:block">
        {selectedVerification ? (
          <VerificationDetail
            item={selectedVerification}
            onApprove={approve}
            onReject={reject}
          />
        ) : (
          <div className="border-border text-muted-foreground flex h-64 items-center justify-center rounded-xl border border-dashed text-sm">
            Select a verification to review
          </div>
        )}
      </div>

      <VerificationDetailSheet
        item={selectedVerification}
        onClose={() => setSelected(null)}
        onApprove={approve}
        onReject={reject}
      />
    </div>
  )
}
