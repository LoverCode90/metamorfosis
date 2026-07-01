import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type {
  SchedulePickupsResponse,
  ScheduledPickupResult,
} from "@/lib/admin/carrier-pickup-types"
import { fetchOrdersForScheduling } from "@/lib/admin/fetch-pickup-orders"
import {
  pickupCarrierAccountId,
  pickupCarrierLabel,
  type PickupCarrierKind,
} from "@/lib/admin/pickup-carrier"
import {
  buildCarrierPickupWindow,
  type CarrierPickupSlotKey,
} from "@/lib/admin/pickup-slots"
import { sendPickupScheduled } from "@/lib/email/pickup-notifications"
import { createShippoClient } from "@/lib/shippo/client"
import { buildShippoPickupLocation } from "@/lib/shippo/build-pickup-location"

interface ScheduleInput {
  admin: SupabaseClient
  orderIds: string[]
  slotKey: CarrierPickupSlotKey
  pickupDate: string
  instructions?: string
}

function groupByCarrier(
  orders: Awaited<ReturnType<typeof fetchOrdersForScheduling>>,
): Map<PickupCarrierKind, { orderIds: string[]; transactionIds: string[] }> {
  const groups = new Map<
    PickupCarrierKind,
    { orderIds: string[]; transactionIds: string[] }
  >()

  for (const order of orders) {
    const entry = groups.get(order.pickupCarrier) ?? {
      orderIds: [],
      transactionIds: [],
    }
    entry.orderIds.push(order.id)
    entry.transactionIds.push(order.shippoTransactionId)
    groups.set(order.pickupCarrier, entry)
  }

  return groups
}

async function scheduleCarrierGroup(
  kind: PickupCarrierKind,
  transactionIds: string[],
  window: ReturnType<typeof buildCarrierPickupWindow>,
  instructions?: string,
): Promise<Omit<ScheduledPickupResult, "carrierPickupId" | "orderCount">> {
  const shippo = createShippoClient()
  const pickup = await shippo.pickups.create({
    carrierAccount: pickupCarrierAccountId(kind),
    location: buildShippoPickupLocation(instructions),
    transactions: transactionIds,
    requestedStartTime: new Date(window.requestedStartTime),
    requestedEndTime: new Date(window.requestedEndTime),
  })

  return {
    pickupCarrier: kind,
    carrierLabel: pickupCarrierLabel(kind),
    status: pickup.status ?? "PENDING",
    confirmationCode: pickup.confirmationCode ?? null,
    confirmedStartTime: pickup.confirmedStartTime ?? null,
    confirmedEndTime: pickup.confirmedEndTime ?? null,
    shippoPickupId: pickup.objectId ?? null,
    messages: pickup.messages ?? [],
  }
}

async function persistPickupRecord(
  admin: SupabaseClient,
  kind: PickupCarrierKind,
  orderIds: string[],
  transactionIds: string[],
  window: ReturnType<typeof buildCarrierPickupWindow>,
  result: Omit<ScheduledPickupResult, "carrierPickupId" | "orderCount">,
  instructions?: string,
): Promise<string> {
  const { data, error } = await admin
    .from("carrier_pickups")
    .insert({
      slot_key: window.slotKey,
      pickup_date: window.pickupDate,
      requested_start_time: window.requestedStartTime,
      requested_end_time: window.requestedEndTime,
      confirmed_start_time: result.confirmedStartTime,
      confirmed_end_time: result.confirmedEndTime,
      status: result.status,
      confirmation_code: result.confirmationCode,
      carrier_instructions: instructions?.trim() || null,
      carrier_account: pickupCarrierAccountId(kind),
      shippo_pickup_id: result.shippoPickupId,
      transaction_ids: transactionIds,
      order_count: orderIds.length,
    })
    .select("id")
    .single()

  if (error || !data) throw new Error("Failed to save pickup record")

  const { error: orderError } = await admin
    .from("orders")
    .update({
      pickup_status: "scheduled",
      carrier_pickup_id: data.id,
    })
    .in("id", orderIds)

  if (orderError) throw new Error("Failed to update order pickup status")

  return data.id
}

export async function scheduleCarrierPickups(
  input: ScheduleInput,
): Promise<SchedulePickupsResponse> {
  const { admin, orderIds, slotKey, pickupDate, instructions } = input

  if (!orderIds.length) {
    throw new Error("Select at least one package to schedule")
  }

  const eligible = await fetchOrdersForScheduling(admin, orderIds)
  if (eligible.length === 0) {
    throw new Error("No eligible orders found for pickup")
  }

  const window = buildCarrierPickupWindow(pickupDate, slotKey)
  const groups = groupByCarrier(eligible)
  const results: ScheduledPickupResult[] = []

  for (const [kind, group] of groups) {
    const partial = await scheduleCarrierGroup(
      kind,
      group.transactionIds,
      window,
      instructions,
    )
    const carrierPickupId = await persistPickupRecord(
      admin,
      kind,
      group.orderIds,
      group.transactionIds,
      window,
      partial,
      instructions,
    )
    results.push({
      ...partial,
      carrierPickupId,
      orderCount: group.orderIds.length,
    })
  }

  await sendPickupScheduled({ pickupDate, slotKey, instructions, results })

  return { success: true, pickupDate, slotKey, results }
}
