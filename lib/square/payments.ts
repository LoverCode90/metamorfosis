import "server-only"

import { SquareClient, SquareEnvironment } from "square"
import crypto from "crypto"

/**
 * Square Payments client.
 * Uses production credentials but NEXT_PUBLIC_PAYMENT_MODE=test
 * so the Square SDK routes through the test payment path — no real charges.
 */
function createPaymentsClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN!,
    environment:
      process.env.NEXT_PUBLIC_PAYMENT_MODE === "test"
        ? SquareEnvironment.Sandbox
        : SquareEnvironment.Production,
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
