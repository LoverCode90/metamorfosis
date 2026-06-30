import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type {
  SchedulePickupsResponse,
  ScheduledPickupResult,
} from "@/lib/admin/carrier-pickup-types"
import { fetchEligiblePickupOrders } from "@/lib/admin/fetch-eligible-pickup-orders"
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
  slotKey: CarrierPickupSlotKey
  pickupDate: string
  instructions?: string
}

function groupTransactionIds(
  orders: Awaited<ReturnType<typeof fetchEligiblePickupOrders>>["orders"],
): Map<PickupCarrierKind, string[]> {
  const groups = new Map<PickupCarrierKind, string[]>()
  for (const order of orders) {
    const list = groups.get(order.pickupCarrier) ?? []
    list.push(order.id)
    groups.set(order.pickupCarrier, list)
  }
  return groups
}

async function loadTransactionIds(
  admin: SupabaseClient,
  orderIds: string[],
): Promise<string[]> {
  const { data, error } = await admin
    .from("orders")
    .select("shippo_transaction_id")
    .in("id", orderIds)

  if (error) throw new Error("Failed to load label transactions")

  return (data ?? [])
    .map((row) => row.shippo_transaction_id as string | null)
    .filter((id): id is string => Boolean(id))
}

async function scheduleCarrierGroup(
  kind: PickupCarrierKind,
  transactionIds: string[],
  window: ReturnType<typeof buildCarrierPickupWindow>,
  instructions?: string,
): Promise<ScheduledPickupResult> {
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
    orderCount: transactionIds.length,
    shippoPickupId: pickup.objectId ?? null,
    messages: pickup.messages ?? [],
  }
}

async function persistPickupRecord(
  admin: SupabaseClient,
  kind: PickupCarrierKind,
  transactionIds: string[],
  window: ReturnType<typeof buildCarrierPickupWindow>,
  result: ScheduledPickupResult,
  instructions?: string,
): Promise<void> {
  const { error } = await admin.from("carrier_pickups").insert({
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
    order_count: result.orderCount,
  })

  if (error) throw new Error("Failed to save pickup record")
}

export async function scheduleCarrierPickups(
  input: ScheduleInput,
): Promise<SchedulePickupsResponse> {
  const { admin, slotKey, pickupDate, instructions } = input
  const eligible = await fetchEligiblePickupOrders(admin)

  if (eligible.total === 0) {
    throw new Error("No eligible labeled orders found for pickup")
  }

  const window = buildCarrierPickupWindow(pickupDate, slotKey)
  const groups = groupTransactionIds(eligible.orders)
  const results: ScheduledPickupResult[] = []

  for (const [kind, orderIds] of groups) {
    const transactionIds = await loadTransactionIds(admin, orderIds)
    if (transactionIds.length === 0) continue

    const result = await scheduleCarrierGroup(
      kind,
      transactionIds,
      window,
      instructions,
    )
    await persistPickupRecord(
      admin,
      kind,
      transactionIds,
      window,
      result,
      instructions,
    )
    results.push(result)
  }

  if (results.length === 0) {
    throw new Error("No carrier pickups could be scheduled")
  }

  await sendPickupScheduled({
    pickupDate,
    slotKey,
    instructions,
    results,
  })

  return { success: true, pickupDate, slotKey, results }
}
