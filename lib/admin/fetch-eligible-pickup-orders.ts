import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import {
  resolvePickupCarrierKind,
  type PickupCarrierKind,
} from "@/lib/admin/pickup-carrier"
import type { EligiblePickupOrder } from "@/lib/admin/carrier-pickup-types"

interface OrderRow {
  id: string
  square_order_id: string
  carrier: string | null
  created_at: string
}

export interface EligiblePickupSummary {
  orders: EligiblePickupOrder[]
  counts: Record<PickupCarrierKind, number>
  total: number
}

export async function fetchEligiblePickupOrders(
  admin: SupabaseClient,
): Promise<EligiblePickupSummary> {
  const { data, error } = await admin
    .from("orders")
    .select("id, square_order_id, carrier, created_at")
    .in("status", ["confirmed", "shipped"])
    .not("shippo_transaction_id", "is", null)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Failed to fetch eligible orders")

  const counts: Record<PickupCarrierKind, number> = {
    usps: 0,
    dhl_express: 0,
  }

  const orders: EligiblePickupOrder[] = []
  for (const row of (data ?? []) as OrderRow[]) {
    const pickupCarrier = resolvePickupCarrierKind(row.carrier)
    if (!pickupCarrier) continue

    counts[pickupCarrier] += 1
    orders.push({
      id: row.id,
      squareOrderId: row.square_order_id,
      carrier: row.carrier ?? "Carrier",
      pickupCarrier,
      createdAt: row.created_at,
    })
  }

  return {
    orders,
    counts,
    total: orders.length,
  }
}
