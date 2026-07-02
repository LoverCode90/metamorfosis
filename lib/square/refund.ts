import "server-only"

import crypto from "crypto"
import { createSquareClient } from "./client"

export interface RefundOrderParams {
  /** Preferred — stored at checkout in orders.square_payment_id */
  squarePaymentId?: string | null
  /** Legacy fallback; may hold a payment ID when square_payment_id is null */
  squareOrderId?: string | null
  amountCents: number
  reason: string
}

/**
 * Refund a captured payment. Uses square_payment_id when available; falls back
 * to square_order_id (legacy rows often store the payment ID there).
 */
export async function refundOrder({
  squarePaymentId,
  squareOrderId,
  amountCents,
  reason,
}: RefundOrderParams) {
  const squareClient = createSquareClient()
  const paymentId = squarePaymentId ?? squareOrderId

  if (!paymentId) {
    throw new Error("No payment ID available for refund")
  }

  const idempotencyKey = crypto.randomUUID()

  try {
    const { refund } = await squareClient.refunds.refundPayment({
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amountCents),
        currency: "USD",
      },
      paymentId,
      reason,
    })

    return refund
  } catch (directErr) {
    // Legacy orders with a real Square order ID in square_order_id
    if (squareOrderId && squarePaymentId && squareOrderId !== squarePaymentId) {
      const { order } = await squareClient.orders.get({
        orderId: squareOrderId,
      })
      if (!order) {
        throw new Error("Order not found in Square")
      }

      const legacyPaymentId =
        order.tenders?.[0]?.paymentId || order.tenders?.[0]?.id
      if (!legacyPaymentId) {
        throw new Error("No payment ID found on the Square order")
      }

      const { refund } = await squareClient.refunds.refundPayment({
        idempotencyKey: crypto.randomUUID(),
        amountMoney: {
          amount: BigInt(amountCents),
          currency: "USD",
        },
        paymentId: legacyPaymentId,
        reason,
      })

      return refund
    }

    throw directErr
  }
}
