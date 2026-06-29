import "server-only"

import { clearDbCart } from "@/lib/cart/db"
import { saveCheckoutAddress } from "@/lib/addresses/db"
import { sendOrderConfirmation } from "@/lib/email/resend"
import type { createAdminClient } from "@/lib/supabase/admin"
import type { CheckoutAddress, PriceSheet } from "@/lib/checkout/types"

type AdminClient = ReturnType<typeof createAdminClient>

interface FinalizeOrderArgs {
  admin: AdminClient
  userId: string | null
  orderId: string
  orderNumber: string
  ip: string
  userAgent: string | null
  address: CheckoutAddress
  guestEmail: string | null
  priceSheet: PriceSheet
}

/**
 * Post-charge side effects: terms-acceptance log, cart clear, address save, and
 * the order-confirmation email. Email + terms log are fire-and-forget.
 */
export async function finalizeOrder({
  admin,
  userId,
  orderId,
  orderNumber,
  ip,
  userAgent,
  address,
  guestEmail,
  priceSheet,
}: FinalizeOrderArgs): Promise<void> {
  admin
    .from("terms_acceptance_log")
    .insert({
      user_id: userId,
      order_id: orderId,
      ip_address: ip,
      user_agent: userAgent,
      terms_version: "v1.0",
    })
    .then(({ error }) => {
      if (error) console.error("[finalize-order] Terms log failed:", error)
    })

  if (userId) {
    await clearDbCart(userId)
    saveCheckoutAddress(userId, address).catch((err) =>
      console.error("[finalize-order] Address save failed:", err),
    )
  }

  const recipientEmail = userId ? address.email : (guestEmail ?? address.email)
  sendOrderConfirmation({
    to: recipientEmail,
    orderNumber,
    address,
    items: priceSheet.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      discountCents: item.discountCents,
    })),
    priceSheet,
    shippingMethod: "standard",
  }).catch((err) => console.error("[finalize-order] Email send failed:", err))
}
