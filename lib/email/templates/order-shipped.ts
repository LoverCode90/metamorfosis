import { emailIntro, emailShell } from "./_layout"

export interface OrderShippedData {
  to: string
  customerName: string
  orderNumber: string
  trackingNumber?: string | null
  trackingUrl?: string | null
  carrier?: string | null
}

function trackingHtml(data: OrderShippedData): string {
  if (!data.trackingNumber) return ""
  const number = data.trackingUrl
    ? `<a href="${data.trackingUrl}" style="color:#111827;font-weight:600;">${data.trackingNumber}</a>`
    : `<span style="font-weight:600;color:#111827;">${data.trackingNumber}</span>`
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin:0 0 8px;">
  <tr><td style="padding:16px 20px;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;">Tracking${data.carrier ? ` · ${data.carrier}` : ""}</p>
    <p style="margin:0;font-size:14px;">${number}</p>
  </td></tr>
</table>`
}

export function buildOrderShippedHtml(data: OrderShippedData): string {
  const body = `${emailIntro(
    "Your order has shipped",
    `Hi ${data.customerName}, your order ${data.orderNumber} is on its way.`,
  )}
${trackingHtml(data)}`
  return emailShell("Your order has shipped", body)
}

export function buildOrderShippedText(data: OrderShippedData): string {
  const tracking = data.trackingNumber
    ? `\nTracking${data.carrier ? ` (${data.carrier})` : ""}: ${data.trackingNumber}${data.trackingUrl ? `\n${data.trackingUrl}` : ""}`
    : ""
  return `Hi ${data.customerName},

Your order ${data.orderNumber} has shipped and is on its way.${tracking}

— Metamorfosis Beauty Supply`
}
