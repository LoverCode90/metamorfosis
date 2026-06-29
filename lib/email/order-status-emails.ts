import "server-only"

import { FROM, getResend, REPLY_TO } from "./resend"
import { emailIntro, emailShell } from "./templates/_layout"
import {
  buildOrderShippedHtml,
  buildOrderShippedText,
  type OrderShippedData,
} from "./templates/order-shipped"
import {
  buildOrderDeliveredHtml,
  buildOrderDeliveredText,
  type OrderDeliveredData,
} from "./templates/order-delivered"

interface Dispatch {
  to: string
  subject: string
  html: string
  text: string
}

/** Sends one email, no-op (with a warning) when Resend isn't configured. */
async function dispatch({ to, subject, html, text }: Dispatch): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY not set — skipping "${subject}"`)
    return
  }
  const { error } = await getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject,
    html,
    text,
  })
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
}

export async function sendOrderShipped(data: OrderShippedData): Promise<void> {
  await dispatch({
    to: data.to,
    subject: `Your order has shipped — ${data.orderNumber}`,
    html: buildOrderShippedHtml(data),
    text: buildOrderShippedText(data),
  })
}

export async function sendOrderDelivered(
  data: OrderDeliveredData,
): Promise<void> {
  await dispatch({
    to: data.to,
    subject: `Your order has been delivered — ${data.orderNumber}`,
    html: buildOrderDeliveredHtml(data),
    text: buildOrderDeliveredText(data),
  })
}

export interface OrderCanceledData {
  to: string
  customerName: string
  orderNumber: string
  reason?: string
}

export async function sendOrderCanceled(
  data: OrderCanceledData,
): Promise<void> {
  const reasonLine = data.reason ? `\n\nReason: ${data.reason}` : ""
  const reasonHtml = data.reason
    ? `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Reason: ${data.reason}</p>`
    : ""
  await dispatch({
    to: data.to,
    subject: `Your order has been canceled — ${data.orderNumber}`,
    html: emailShell(
      "Your order has been canceled",
      `${emailIntro(
        "Your order has been canceled",
        `Hi ${data.customerName}, your order ${data.orderNumber} has been canceled and a full refund has been issued to your original payment method (3–5 business days).`,
      )}${reasonHtml}`,
    ),
    text: `Hi ${data.customerName},

Your order ${data.orderNumber} has been canceled and fully refunded to your original payment method (3–5 business days).${reasonLine}

— Metamorfosis Beauty Supply`,
  })
}
