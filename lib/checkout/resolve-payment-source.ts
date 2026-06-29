import "server-only"

import {
  getOrCreateCustomer,
  createCardOnFile,
  retrieveCardMetadata,
} from "@/lib/square/payments"
import type { createAdminClient } from "@/lib/supabase/admin"
import type { CheckoutAddress } from "@/lib/checkout/types"

type AdminClient = ReturnType<typeof createAdminClient>

interface ResolvePaymentSourceArgs {
  admin: AdminClient
  userId: string
  sourceId: string
  saveCardConsented: boolean
  squareCustomerId: string | null
  address: CheckoutAddress
}

/**
 * Returns the Square source id to charge. When the buyer opts to save the card,
 * creates/links a Square Customer + card-on-file, persists the metadata (max 3
 * per user), and returns the saved card id. Falls back to the original nonce on
 * any failure so the charge can still proceed.
 */
export async function resolvePaymentSource({
  admin,
  userId,
  sourceId,
  saveCardConsented,
  squareCustomerId,
  address,
}: ResolvePaymentSourceArgs): Promise<string> {
  if (sourceId.startsWith("ccof:")) return sourceId
  if (!saveCardConsented) return sourceId

  const customerId =
    squareCustomerId ??
    (await getOrCreateCustomer(userId, address.email, address.fullName))
  if (!customerId) return sourceId

  const cardId = await createCardOnFile(sourceId, customerId)
  if (!cardId) return sourceId

  await admin
    .from("profiles")
    .update({ square_customer_id: customerId, square_card_id: cardId })
    .eq("id", userId)

  const { count } = await admin
    .from("saved_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)

  if ((count ?? 0) < 3) {
    const meta = await retrieveCardMetadata(cardId)
    if (meta) {
      await admin.from("saved_cards").insert({
        user_id: userId,
        square_card_id: cardId,
        square_customer_id: customerId,
        brand: meta.brand,
        last_four: meta.last4,
        exp_month: meta.expMonth,
        exp_year: meta.expYear,
        is_default: (count ?? 0) === 0,
      })
    }
  }
  return cardId
}
