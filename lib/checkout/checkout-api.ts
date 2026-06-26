import type { SavedCardMeta } from "@/components/checkout/steps/step-payment"
import type {
  CheckoutAddress,
  CheckoutPayload,
  PlaceOrderResponse,
} from "@/lib/checkout/types"

/** Fetches the user's first saved card, or null when none exists. */
export async function fetchSavedCard(): Promise<SavedCardMeta | null> {
  const res = await fetch("/api/profile/cards")
  const body = (await res.json()) as { cards: SavedCardMeta[] }
  return body.cards[0] ?? null
}

/**
 * Fetches the destination sales-tax rate.
 * @returns The rate, or null to keep the existing default.
 */
export async function fetchTaxRate(
  zip: string,
  state: string,
): Promise<number | null> {
  const res = await fetch(
    `/api/checkout/tax-rate?zip=${encodeURIComponent(zip)}&state=${encodeURIComponent(state)}`,
  )
  const json = (await res.json()) as { rate?: number }
  return typeof json.rate === "number" ? json.rate : null
}

/** Persists the address as the user's default shipping address. */
export async function saveDefaultAddress(
  address: CheckoutAddress,
): Promise<void> {
  await fetch("/api/addresses/default", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
  })
}

/** Submits the checkout payload for server-side validation and charge. */
export async function placeOrder(
  payload: CheckoutPayload,
): Promise<PlaceOrderResponse> {
  const res = await fetch("/api/checkout/validate-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return (await res.json()) as PlaceOrderResponse
}
