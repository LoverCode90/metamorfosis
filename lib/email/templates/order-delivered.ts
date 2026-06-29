import { emailIntro, emailShell } from "./_layout"

export interface OrderDeliveredData {
  to: string
  customerName: string
  orderNumber: string
}

export function buildOrderDeliveredHtml(data: OrderDeliveredData): string {
  const body = emailIntro(
    "Your order has been delivered",
    `Hi ${data.customerName}, your order ${data.orderNumber} has been delivered. We hope you love it! If anything isn't right, just reply to this email.`,
  )
  return emailShell("Your order has been delivered", body)
}

export function buildOrderDeliveredText(data: OrderDeliveredData): string {
  return `Hi ${data.customerName},

Your order ${data.orderNumber} has been delivered. We hope you love it!

If anything isn't right, just reply to this email.

— Metamorfosis Beauty Supply`
}
