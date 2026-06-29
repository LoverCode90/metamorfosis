"use client"

import { useCallback, useState } from "react"
import type { DbOrder } from "@/lib/orders/types"

const PAGE_SIZE = 10

export interface OrdersPaginationResult {
  orders: DbOrder[]
  hasMore: boolean
  loading: boolean
  loadMore: () => Promise<void>
}

export function useOrdersPagination(
  initialOrders: DbOrder[],
  initialHasMore: boolean,
): OrdersPaginationResult {
  const [orders, setOrders] = useState<DbOrder[]>(initialOrders)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(initialOrders.length)

  const loadMore = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?offset=${offset}&limit=${PAGE_SIZE}`)
      if (!res.ok) return
      const data = (await res.json()) as {
        orders: DbOrder[]
        hasMore: boolean
      }
      setOrders((prev) => [...prev, ...data.orders])
      setHasMore(data.hasMore)
      setOffset((prev) => prev + data.orders.length)
    } finally {
      setLoading(false)
    }
  }, [offset])

  return { orders, hasMore, loading, loadMore }
}
