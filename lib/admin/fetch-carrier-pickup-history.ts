import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type { CarrierPickupRecord } from "@/lib/admin/carrier-pickup-types"
import type { CarrierPickupSlotKey } from "@/lib/admin/pickup-slots"

interface PickupRow {
  id: string
  slot_key: string
  pickup_date: string
  requested_start_time: string
  requested_end_time: string
  confirmed_start_time: string | null
  confirmed_end_time: string | null
  status: string
  confirmation_code: string | null
  carrier_instructions: string | null
  carrier_account: string | null
  order_count: number
  created_at: string
}

export async function fetchCarrierPickupHistory(
  admin: SupabaseClient,
  limit = 12,
): Promise<CarrierPickupRecord[]> {
  const { data, error } = await admin
    .from("carrier_pickups")
    .select(
      `id, slot_key, pickup_date, requested_start_time, requested_end_time,
       confirmed_start_time, confirmed_end_time, status, confirmation_code,
       carrier_instructions, carrier_account, order_count, created_at`,
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw new Error("Failed to fetch pickup history")

  return ((data ?? []) as PickupRow[]).map((row) => ({
    id: row.id,
    slotKey: row.slot_key as CarrierPickupSlotKey,
    pickupDate: row.pickup_date,
    requestedStartTime: row.requested_start_time,
    requestedEndTime: row.requested_end_time,
    confirmedStartTime: row.confirmed_start_time,
    confirmedEndTime: row.confirmed_end_time,
    status: row.status,
    confirmationCode: row.confirmation_code,
    carrierInstructions: row.carrier_instructions,
    carrierAccount: row.carrier_account,
    orderCount: row.order_count,
    createdAt: row.created_at,
  }))
}
