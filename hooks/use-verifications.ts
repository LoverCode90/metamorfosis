"use client"

import { useCallback, useEffect, useState } from "react"

import {
  approveVerification,
  fetchVerifications,
  rejectVerification,
} from "@/lib/admin/verifications-api"
import type { StatusFilter, VerificationRow } from "@/lib/admin/verifications"

export interface UseVerificationsResult {
  filter: StatusFilter
  setFilter: (filter: StatusFilter) => void
  items: VerificationRow[]
  selected: VerificationRow | null
  setSelected: (row: VerificationRow | null) => void
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  refresh: () => void
  loadMore: () => void
  approve: (id: string) => Promise<void>
  reject: (id: string, reason: string) => Promise<void>
}

/**
 * Owns all verifications dashboard data: paginated fetching per status filter,
 * selection, and approve/reject mutations with optimistic list updates.
 * Approve/reject reject (throw) on server error so callers can surface it.
 */
export function useVerifications(): UseVerificationsResult {
  const [filter, setFilter] = useState<StatusFilter>("pending_review")
  const [items, setItems] = useState<VerificationRow[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selected, setSelected] = useState<VerificationRow | null>(null)

  const loadInitial = useCallback(async (status: StatusFilter) => {
    try {
      const data = await fetchVerifications(status)
      setItems(data.items)
      setNextCursor(data.nextCursor)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true)
    setSelected(null)
    void loadInitial(filter)
  }, [filter, loadInitial])

  function refresh() {
    setIsLoading(true)
    void loadInitial(filter)
  }

  async function loadMore() {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const data = await fetchVerifications(filter, nextCursor)
      setItems((prev) => [...prev, ...data.items])
      setNextCursor(data.nextCursor)
    } finally {
      setIsLoadingMore(false)
    }
  }

  function patchItem(id: string, patch: Partial<VerificationRow>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
    setSelected((prev) => (prev?.id === id ? { ...prev, ...patch } : prev))
  }

  async function approve(id: string) {
    await approveVerification(id)
    patchItem(id, { verification_status: "approved", rejection_reason: null })
  }

  async function reject(id: string, reason: string) {
    await rejectVerification(id, reason)
    patchItem(id, { verification_status: "rejected", rejection_reason: reason })
  }

  return {
    filter,
    setFilter,
    items,
    selected,
    setSelected,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextCursor),
    refresh,
    loadMore,
    approve,
    reject,
  }
}
