import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type { PickupScheduleData } from "@/lib/admin/carrier-pickup-types"
import { fetchCarrierPickupHistory } from "@/lib/admin/fetch-carrier-pickup-history"
import { fetchEligiblePickupOrders } from "@/lib/admin/fetch-eligible-pickup-orders"
import { getShipFromAddress } from "@/lib/shippo/ship-from"

export async function loadPickupScheduleData(
  admin: SupabaseClient,
): Promise<PickupScheduleData> {
  const [eligible, history] = await Promise.all([
    fetchEligiblePickupOrders(admin),
    fetchCarrierPickupHistory(admin),
  ])

  const from = getShipFromAddress()

  return {
    eligibleOrders: eligible.orders,
    eligibleCounts: eligible.counts,
    eligibleTotal: eligible.total,
    history,
    shipFrom: {
      name: from.name,
      company: from.company,
      street1: from.street1,
      city: from.city,
      state: from.state,
      zip: from.zip,
      phone: from.phone,
    },
  }
}
