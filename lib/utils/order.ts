import type { CartItem, Order } from "@/lib/types"
import { computeTotals } from "./totals"

function randomDigits(length: number) {
  let out = ""
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10)
  return out
}

function randomAlphaNum(length: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < length; i++)
    out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export function createOrder(
  items: CartItem[],
  details: { email: string; shipName: string; shipAddress: string },
): Order {
  return {
    number: `ORD-2026-${randomDigits(5)}`,
    trackingId: `SHP-${randomAlphaNum(10)}`,
    email: details.email,
    shipName: details.shipName,
    shipAddress: details.shipAddress,
    items,
    totals: computeTotals(items),
    placedAt: Date.now(),
  }
}
