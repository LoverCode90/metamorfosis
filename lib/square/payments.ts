import "server-only"

import { SquareClient, SquareEnvironment } from "square"
import crypto from "crypto"

/** Production Square credentials — always use Production API. */
function createPaymentsClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN!,
    environment: SquareEnvironment.Production,
  })
}

export interface ChargeResult {
  ok: true
  paymentId: string
  squareOrderId: string
  receiptUrl: string | null
}

export interface ChargeError {
  ok: false
  error: string
}

/**
 * Charge a tokenized card via Square Payments API.
 * sourceId comes from the Square Web Payments SDK card nonce.
 */
export async function chargeCard(
  sourceId: string,
  amountCents: number,
  locationId: string,
  note?: string,
): Promise<ChargeResult | ChargeError> {
  // Dev/staging: tokenize via production Web Payments SDK but skip the charge.
  if (process.env.NEXT_PUBLIC_PAYMENT_MODE === "test") {
    return {
      ok: true,
      paymentId: `test-${crypto.randomUUID()}`,
      squareOrderId: "",
      receiptUrl: null,
    }
  }

  const client = createPaymentsClient()
  const idempotencyKey = crypto.randomUUID()

  try {
    const { payment } = await client.payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amountCents),
        currency: "USD",
      },
      locationId,
      note,
      autocomplete: true,
    })

    if (!payment) {
      return { ok: false, error: "No payment returned from Square" }
    }

    return {
      ok: true,
      paymentId: payment.id ?? "",
      squareOrderId: payment.orderId ?? "",
      receiptUrl: payment.receiptUrl ?? null,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Payment failed"
    console.error("[square/payments] charge error:", err)
    return { ok: false, error: msg }
  }
}
