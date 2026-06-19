import "server-only"

import { Resend } from "resend"
import {
  buildOrderConfirmationHtml,
  buildOrderConfirmationText,
  type OrderConfirmationData,
} from "./templates/order-confirmation"

let _resend: Resend | null = null

function getResend(): Resend {
  if (_resend) return _resend
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY is not set")
  _resend = new Resend(key)
  return _resend
}

const FROM =
  process.env.EMAIL_FROM ?? "Metamorfosis Beauty <orders@metamorfosis.beauty>"

export async function sendOrderConfirmation(
  data: OrderConfirmationData,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping order confirmation")
    return
  }

  const resend = getResend()
  const { error } = await resend.emails.send({
    from: FROM,
    to: data.to,
    subject: `Your order ${data.orderNumber} is confirmed — Metamorfosis Beauty`,
    html: buildOrderConfirmationHtml(data),
    text: buildOrderConfirmationText(data),
  })

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`)
  }
}
