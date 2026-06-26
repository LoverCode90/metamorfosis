import "server-only"

import crypto from "crypto"
import { createSquareClient } from "./client"

export async function refundOrder(
  squareOrderId: string,
  amountCents: number,
  reason: string,
) {
  const squareClient = createSquareClient()

  // Fetch order to get the payment ID
  const { order } = await squareClient.orders.get({ orderId: squareOrderId })
  if (!order) {
    throw new Error("Order not found in Square")
  }

  const paymentId = order.tenders?.[0]?.paymentId || order.tenders?.[0]?.id
  if (!paymentId) {
    throw new Error("No payment ID found on the Square order")
  }

  const idempotencyKey = crypto.randomUUID()

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
}
