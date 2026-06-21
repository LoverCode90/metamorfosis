"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronRight, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils/format"
import { VerificationDetail } from "./verification-detail"

export interface VerificationRow {
  id: string
  full_name: string
  email: string
  role: string
  verification_status: string
  rejection_reason: string | null
  license_number: string | null
  document_url: string | null
  expiration_date: string | null
  business_name: string | null
  created_at: string
  updated_at: string
}

type StatusFilter = "pending_review" | "approved" | "rejected" | "all"

const FILTER_TABS: { label: string; value: StatusFilter }[] = [
  { label: "Pending", value: "pending_review" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
]

const STATUS_BADGES: Record<string, string> = {
  pending_review: "text-amber-400 bg-amber-400/10 border border-amber-400/20",
  approved: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
  rejected: "text-rose-400 bg-rose-400/10 border border-rose-400/20",
}

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

export function VerificationsDashboard() {
  const [filter, setFilter] = useState<StatusFilter>("pending_review")
  const [items, setItems] = useState<VerificationRow[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selected, setSelected] = useState<VerificationRow | null>(null)

  const fetchItems = useCallback(
    async (status: StatusFilter, cursor?: string) => {
      const params = new URLSearchParams({ status })
      if (cursor) params.set("cursor", cursor)

      const res = await fetch(`/api/admin/verifications?${params.toString()}`)
      const data = (await res.json()) as {
        items: VerificationRow[]
        nextCursor: string | null
      }
      return data
    },
    [],
  )

  const loadInitial = useCallback(
    async (status: StatusFilter) => {
      try {
        const data = await fetchItems(status)
        setItems(data.items)
        setNextCursor(data.nextCursor)
      } finally {
        setIsLoading(false)
      }
    },
    [fetchItems],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    setSelected(null)
    void loadInitial(filter)
  }, [filter, loadInitial])

  async function loadMore() {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const data = await fetchItems(filter, nextCursor)
      setItems((prev) => [...prev, ...data.items])
      setNextCursor(data.nextCursor)
    } finally {
      setIsLoadingMore(false)
    }
  }

  function updateItemInList(id: string, patch: Partial<VerificationRow>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
    setSelected((prev) => (prev?.id === id ? { ...prev, ...patch } : prev))
  }

  async function handleApprove(id: string) {
    const res = await fetch(`/api/admin/verifications/${id}/approve`, {
      method: "POST",
    })
    if (!res.ok) {
      const err = (await res.json()) as { error?: string }
      throw new Error(err.error ?? "Approval failed")
    }
    updateItemInList(id, {
      verification_status: "approved",
      rejection_reason: null,
    })
  }

  async function handleReject(id: string, reason: string) {
    const res = await fetch(`/api/admin/verifications/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    })
    if (!res.ok) {
      const err = (await res.json()) as { error?: string }
      throw new Error(err.error ?? "Rejection failed")
    }
    updateItemInList(id, {
      verification_status: "rejected",
      rejection_reason: reason,
    })
  }

  return (
    <div className="flex h-full min-h-0 gap-6">
      {/* ── Left: list ───────────────────────────────────────────────────── */}
      <div className="flex w-full max-w-md flex-col gap-4 lg:w-[420px] lg:shrink-0">
        {/* Filter tabs */}
        <div className="border-border flex gap-1 rounded-lg border p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                filter === tab.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={() => void loadInitial(filter)}
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 self-end text-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-3 w-3" strokeWidth={2} />
          Refresh
        </button>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground py-16 text-center text-sm">
              No verifications found.
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelected((prev) =>
                        prev?.id === item.id ? null : item,
                      )
                    }
                    className={cn(
                      "border-border w-full rounded-xl border p-4 text-left transition-colors",
                      selected?.id === item.id
                        ? "bg-foreground/5 border-foreground/20"
                        : "bg-background hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {item.full_name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {item.email}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            STATUS_BADGES[item.verification_status] ??
                              "text-muted-foreground bg-muted",
                          )}
                        >
                          {STATUS_LABELS[item.verification_status] ??
                            item.verification_status}
                        </span>
                        <ChevronRight
                          className="text-muted-foreground h-4 w-4"
                          strokeWidth={1.75}
                        />
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Updated {formatDate(item.updated_at)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {nextCursor && !isLoading && (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={isLoadingMore}
              className="text-muted-foreground hover:text-foreground mt-3 w-full py-2 text-sm transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      </div>

      {/* ── Right: detail ────────────────────────────────────────────────── */}
      <div className="hidden flex-1 lg:block">
        {selected ? (
          <VerificationDetail
            item={selected}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : (
          <div className="border-border text-muted-foreground flex h-64 items-center justify-center rounded-xl border border-dashed text-sm">
            Select a verification to review
          </div>
        )}
      </div>
    </div>
  )
}
