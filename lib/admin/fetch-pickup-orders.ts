import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type {
  PickupOrderRow,
  PickupPageTab,
  PickupScheduledTabResponse,
  PickupTabResponse,
  PickupWindowInfo,
} from "@/lib/admin/carrier-pickup-types"
import {
  pickupCarrierLabel,
  resolvePickupCarrierKind,
  type PickupCarrierKind,
} from "@/lib/admin/pickup-carrier"
import { CARRIER_PICKUP_SLOTS } from "@/lib/admin/pickup-slots"

interface OrderPickupRow {
  id: string
  carrier: string | null
  shipping_address: { fullName?: string } | null
  label_purchased_at: string | null
  shipping_service: string | null
  tracking_number: string | null
  label_cost_cents: number | null
  pickup_status: string
  carrier_pickup_id: string | null
  carrier_pickups:
    | {
        pickup_date: string
        slot_key: string
        confirmation_code: string | null
      }
    | {
        pickup_date: string
        slot_key: string
        confirmation_code: string | null
      }[]
    | null
}

function resolvePickupJoin(
  pickup: OrderPickupRow["carrier_pickups"] | undefined,
): {
  pickup_date: string
  slot_key: string
  confirmation_code: string | null
} | null {
  if (!pickup) return null
  if (Array.isArray(pickup)) return pickup[0] ?? null
  return pickup
}

const PICKUP_ORDER_SELECT = `
  id, carrier, shipping_address, label_purchased_at, shipping_service,
  tracking_number, label_cost_cents, pickup_status, carrier_pickup_id,
  carrier_pickups ( pickup_date, slot_key, confirmation_code )
`

function mapOrderRow(row: OrderPickupRow): PickupOrderRow | null {
  const pickupCarrier = resolvePickupCarrierKind(row.carrier)
  if (!pickupCarrier) return null

  const pickup = resolvePickupJoin(row.carrier_pickups)
  let pickupWindow: PickupWindowInfo | null = null
  if (pickup?.pickup_date && pickup.slot_key) {
    const slotKey = pickup.slot_key as keyof typeof CARRIER_PICKUP_SLOTS
    pickupWindow = {
      pickupDate: pickup.pickup_date,
      slotKey,
      slotLabel: CARRIER_PICKUP_SLOTS[slotKey]?.label ?? pickup.slot_key,
      confirmationCode: pickup.confirmation_code,
    }
  }

  const address = row.shipping_address as { fullName?: string } | null

  return {
    id: row.id,
    recipientName: address?.fullName?.trim() || "Customer",
    labelPurchasedAt: row.label_purchased_at,
    pickupCarrier,
    carrierDisplay: pickupCarrierLabel(pickupCarrier),
    serviceName: row.shipping_service,
    trackingNumber: row.tracking_number,
    labelCostCents: row.label_cost_cents,
    pickupStatus: row.pickup_status as PickupOrderRow["pickupStatus"],
    pickupWindow,
  }
}

export async function fetchPickupReadyOrders(
  admin: SupabaseClient,
): Promise<PickupOrderRow[]> {
  const { data, error } = await admin
    .from("orders")
    .select(PICKUP_ORDER_SELECT)
    .in("status", ["confirmed", "shipped"])
    .eq("pickup_status", "unscheduled")
    .not("shippo_transaction_id", "is", null)
    .order("label_purchased_at", { ascending: false, nullsFirst: false })

  if (error) throw new Error("Failed to fetch ready pickup orders")

  return ((data ?? []) as unknown as OrderPickupRow[])
    .map(mapOrderRow)
    .filter((row): row is PickupOrderRow => row !== null)
}

export async function fetchPickupScheduledTab(
  admin: SupabaseClient,
): Promise<PickupScheduledTabResponse> {
  const { data, error } = await admin
    .from("orders")
    .select(PICKUP_ORDER_SELECT)
    .eq("status", "confirmed")
    .eq("pickup_status", "scheduled")
    .not("shippo_transaction_id", "is", null)
    .order("label_purchased_at", { ascending: false, nullsFirst: false })

  if (error) throw new Error("Failed to fetch scheduled pickup orders")

  const rawRows = (data ?? []) as unknown as OrderPickupRow[]
  const rows = rawRows
    .map(mapOrderRow)
    .filter((row): row is PickupOrderRow => row !== null)

  const usps = rows.filter((r) => r.pickupCarrier === "usps")
  const dhlExpress = rows.filter((r) => r.pickupCarrier === "dhl_express")

  const firstRaw = rawRows.find((r) => r.carrier_pickup_id)
  let pickupMeta: PickupScheduledTabResponse["pickupMeta"] = null

  if (firstRaw?.carrier_pickups) {
    const joined = resolvePickupJoin(firstRaw.carrier_pickups)
    if (joined) {
      const slotKey = joined.slot_key as keyof typeof CARRIER_PICKUP_SLOTS
      pickupMeta = {
        pickupDate: joined.pickup_date,
        slotKey,
        slotLabel: CARRIER_PICKUP_SLOTS[slotKey]?.label ?? slotKey,
        confirmationCode: joined.confirmation_code,
        confirmedStartTime: null,
        confirmedEndTime: null,
      }

      if (firstRaw.carrier_pickup_id) {
        const { data: pickupRecord } = await admin
          .from("carrier_pickups")
          .select("confirmed_start_time, confirmed_end_time, confirmation_code")
          .eq("id", firstRaw.carrier_pickup_id)
          .maybeSingle()

        if (pickupRecord) {
          pickupMeta.confirmedStartTime = pickupRecord.confirmed_start_time
          pickupMeta.confirmedEndTime = pickupRecord.confirmed_end_time
          if (pickupRecord.confirmation_code) {
            pickupMeta.confirmationCode = pickupRecord.confirmation_code
          }
        }
      }
    }
  }

  return { tab: "scheduled", usps, dhlExpress, pickupMeta }
}

export async function fetchPickupHistoryOrders(
  admin: SupabaseClient,
  offset: number,
  limit: number,
): Promise<PickupTabResponse> {
  const { data, error, count } = await admin
    .from("orders")
    .select(PICKUP_ORDER_SELECT, { count: "exact" })
    .eq("pickup_status", "completed")
    .in("status", ["shipped", "delivered"])
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error("Failed to fetch pickup history")

  const rows = ((data ?? []) as unknown as OrderPickupRow[])
    .map(mapOrderRow)
    .filter((row): row is PickupOrderRow => row !== null)

  const total = count ?? 0
  return {
    tab: "history",
    rows,
    total,
    offset,
    limit,
    hasMore: offset + rows.length < total,
  }
}

export async function fetchPickupTabData(
  admin: SupabaseClient,
  tab: PickupPageTab,
  offset: number,
  limit: number,
): Promise<PickupTabResponse | PickupScheduledTabResponse> {
  if (tab === "scheduled") return fetchPickupScheduledTab(admin)
  if (tab === "history") return fetchPickupHistoryOrders(admin, offset, limit)

  const rows = await fetchPickupReadyOrders(admin)
  return {
    tab: "ready",
    rows,
    total: rows.length,
    offset: 0,
    limit: rows.length,
    hasMore: false,
  }
}

export async function fetchOrdersForScheduling(
  admin: SupabaseClient,
  orderIds: string[],
): Promise<
  {
    id: string
    pickupCarrier: PickupCarrierKind
    shippoTransactionId: string
  }[]
> {
  const { data, error } = await admin
    .from("orders")
    .select("id, carrier, shippo_transaction_id, pickup_status, status")
    .in("id", orderIds)

  if (error) throw new Error("Failed to load selected orders")

  const eligible: {
    id: string
    pickupCarrier: PickupCarrierKind
    shippoTransactionId: string
  }[] = []

  for (const row of data ?? []) {
    if (row.status !== "confirmed" && row.status !== "shipped") continue
    if (row.pickup_status !== "unscheduled") continue
    if (!row.shippo_transaction_id) continue
    const pickupCarrier = resolvePickupCarrierKind(row.carrier)
    if (!pickupCarrier) continue
    eligible.push({
      id: row.id,
      pickupCarrier,
      shippoTransactionId: row.shippo_transaction_id,
    })
  }

  return eligible
}
