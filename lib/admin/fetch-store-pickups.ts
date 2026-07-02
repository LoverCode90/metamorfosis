import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { CANCELABLE_PICKUP_STATUSES } from "@/lib/orders/cancel-pickup-order"
import type {
  StorePickupCancelSource,
  StorePickupHistoryOrder,
  StorePickupOrder,
  StorePickupPage,
} from "@/lib/admin/store-pickup-types"
import {
  STORE_PICKUP_PAGE_SIZE,
  storePickupActivityAt,
} from "@/lib/admin/store-pickup-types"

const STORE_PICKUP_SELECT = `
  id, square_order_id, status, total_cents, created_at, updated_at,
  pickup_deadline_at, picked_up_at, guest_email, shipping_address,
  profiles ( first_name, last_name, full_name ),
  order_items (
    quantity,
    product_variations (
      name_en,
      image_url,
      product_translations ( name_en, image_url )
    )
  )
`

const HISTORY_FETCH_BUFFER = 30

function parseCompositeCursor(
  cursor: string | null | undefined,
): [string | null, string | null] {
  if (!cursor) return [null, null]
  const separator = cursor.indexOf("|")
  if (separator === -1) return [cursor, null]
  return [cursor.slice(0, separator), cursor.slice(separator + 1)]
}

function compositeCursor(at: string, id: string): string {
  return `${at}|${id}`
}

function pageResult<T extends { id: string; created_at: string }>(
  rows: T[],
  limit: number,
  cursorAt: (row: T) => string,
): { items: T[]; nextCursor: string | null } {
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const last = items[items.length - 1]
  return {
    items,
    nextCursor:
      hasMore && last ? compositeCursor(cursorAt(last), last.id) : null,
  }
}

async function resolveCancelSources(
  orderIds: string[],
): Promise<Map<string, StorePickupCancelSource>> {
  const map = new Map<string, StorePickupCancelSource>()
  if (orderIds.length === 0) return map

  const admin = createAdminClient()
  const { data } = await admin
    .from("audit_logs")
    .select("target_id, action")
    .eq("target_table", "orders")
    .in("target_id", orderIds)
    .in("action", ["pickup_deadline_expired", "admin_cancel_pickup"])

  for (const row of data ?? []) {
    if (!row.target_id) continue
    if (row.action === "pickup_deadline_expired") {
      map.set(row.target_id, "deadline_expired")
    } else if (
      row.action === "admin_cancel_pickup" &&
      !map.has(row.target_id)
    ) {
      map.set(row.target_id, "admin_manual")
    }
  }
  return map
}

async function attachCancelSources(
  orders: StorePickupOrder[],
): Promise<StorePickupHistoryOrder[]> {
  const canceledIds = orders
    .filter((order) => order.status === "canceled")
    .map((order) => order.id)
  const sources = await resolveCancelSources(canceledIds)

  return orders.map((order) => ({
    ...order,
    cancelSource:
      order.status === "canceled" ? (sources.get(order.id) ?? "unknown") : null,
  }))
}

export async function fetchPendingStorePickupsPage(
  limit = STORE_PICKUP_PAGE_SIZE,
  cursor?: string,
): Promise<StorePickupPage> {
  const [cursorAt, cursorId] = parseCompositeCursor(cursor)
  const admin = createAdminClient()

  let query = admin
    .from("orders")
    .select(STORE_PICKUP_SELECT)
    .eq("carrier", "pickup")
    .in("status", [...CANCELABLE_PICKUP_STATUSES])
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1)

  if (cursorAt && cursorId) {
    query = query.or(
      `and(created_at.eq.${cursorAt},id.lt.${cursorId}),created_at.lt.${cursorAt}`,
    )
  }

  const { data, error } = await query

  if (error) {
    console.error("[fetchPendingStorePickupsPage]", error)
    return { items: [], nextCursor: null }
  }

  const orders = (data ?? []) as unknown as StorePickupOrder[]
  const { items, nextCursor } = pageResult(
    orders,
    limit,
    (row) => row.created_at,
  )

  return {
    items: await attachCancelSources(items),
    nextCursor,
  }
}

export async function fetchCanceledStorePickupsPage(
  limit = STORE_PICKUP_PAGE_SIZE,
  cursor?: string,
): Promise<StorePickupPage> {
  const [cursorAt, cursorId] = parseCompositeCursor(cursor)
  const admin = createAdminClient()

  let query = admin
    .from("orders")
    .select(STORE_PICKUP_SELECT)
    .eq("carrier", "pickup")
    .eq("status", "canceled")
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1)

  if (cursorAt && cursorId) {
    query = query.or(
      `and(updated_at.eq.${cursorAt},id.lt.${cursorId}),updated_at.lt.${cursorAt}`,
    )
  }

  const { data, error } = await query

  if (error) {
    console.error("[fetchCanceledStorePickupsPage]", error)
    return { items: [], nextCursor: null }
  }

  const orders = (data ?? []) as unknown as StorePickupOrder[]
  const { items, nextCursor } = pageResult(
    orders,
    limit,
    (row) => row.updated_at,
  )

  return {
    items: await attachCancelSources(items),
    nextCursor,
  }
}

function compareHistoryOrders(
  a: StorePickupHistoryOrder,
  b: StorePickupHistoryOrder,
): number {
  const activityCmp = storePickupActivityAt(b).localeCompare(
    storePickupActivityAt(a),
  )
  if (activityCmp !== 0) return activityCmp
  return b.id.localeCompare(a.id)
}

function isBeforeHistoryCursor(
  order: StorePickupHistoryOrder,
  cursorAt: string,
  cursorId: string,
): boolean {
  const activityAt = storePickupActivityAt(order)
  if (activityAt < cursorAt) return true
  if (activityAt > cursorAt) return false
  return order.id < cursorId
}

export async function fetchHistoryStorePickupsPage(
  limit = STORE_PICKUP_PAGE_SIZE,
  cursor?: string,
): Promise<StorePickupPage> {
  const [cursorAt, cursorId] = parseCompositeCursor(cursor)
  const admin = createAdminClient()

  let fulfilledQuery = admin
    .from("orders")
    .select(STORE_PICKUP_SELECT)
    .eq("carrier", "pickup")
    .eq("status", "delivered")
    .order("picked_up_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .limit(HISTORY_FETCH_BUFFER)

  let canceledQuery = admin
    .from("orders")
    .select(STORE_PICKUP_SELECT)
    .eq("carrier", "pickup")
    .eq("status", "canceled")
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(HISTORY_FETCH_BUFFER)

  if (cursorAt && cursorId) {
    fulfilledQuery = fulfilledQuery.or(
      `and(picked_up_at.eq.${cursorAt},id.lt.${cursorId}),picked_up_at.lt.${cursorAt}`,
    )
    canceledQuery = canceledQuery.or(
      `and(updated_at.eq.${cursorAt},id.lt.${cursorId}),updated_at.lt.${cursorAt}`,
    )
  }

  const [fulfilledResult, canceledResult] = await Promise.all([
    fulfilledQuery,
    canceledQuery,
  ])

  if (fulfilledResult.error) {
    console.error(
      "[fetchHistoryStorePickupsPage] fulfilled",
      fulfilledResult.error,
    )
  }
  if (canceledResult.error) {
    console.error(
      "[fetchHistoryStorePickupsPage] canceled",
      canceledResult.error,
    )
  }

  const fulfilled = (fulfilledResult.data ??
    []) as unknown as StorePickupOrder[]
  const canceled = (canceledResult.data ?? []) as unknown as StorePickupOrder[]
  const merged = await attachCancelSources([...fulfilled, ...canceled])

  let sorted = merged.sort(compareHistoryOrders)

  if (cursorAt && cursorId) {
    sorted = sorted.filter((order) =>
      isBeforeHistoryCursor(order, cursorAt, cursorId),
    )
  }

  const hasMore = sorted.length > limit
  const items = sorted.slice(0, limit)
  const last = items[items.length - 1]

  return {
    items,
    nextCursor:
      hasMore && last
        ? compositeCursor(storePickupActivityAt(last), last.id)
        : null,
  }
}

/** @deprecated Use fetchPendingStorePickupsPage for paginated lists. */
export async function fetchPendingStorePickups(): Promise<StorePickupOrder[]> {
  const page = await fetchPendingStorePickupsPage(1000)
  return page.items
}

/** @deprecated Use fetchHistoryStorePickupsPage for paginated lists. */
export async function fetchFulfilledStorePickups(
  limit = 10,
): Promise<StorePickupOrder[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("orders")
    .select(STORE_PICKUP_SELECT)
    .eq("carrier", "pickup")
    .eq("status", "delivered")
    .order("picked_up_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[fetchFulfilledStorePickups]", error)
    return []
  }
  return (data ?? []) as unknown as StorePickupOrder[]
}

/** @deprecated Use fetchCanceledStorePickupsPage for paginated lists. */
export async function fetchExpiredStorePickups(
  limit = 10,
): Promise<StorePickupHistoryOrder[]> {
  const page = await fetchCanceledStorePickupsPage(limit)
  return page.items
}
