import type { CheckoutAddress } from "@/lib/checkout/types"
import type { ShippingMethod } from "@/lib/checkout/types"
import {
  PICKUP_ADDRESS,
  PICKUP_HOURS,
  PICKUP_HOURS_NOTE,
  pickupHoursText,
} from "@/lib/checkout/pickup"
import { PICKUP_WINDOW_DAYS } from "@/lib/orders/order-status-config"
import { EMAIL_ADDRESSES } from "@/lib/email/addresses"
import { APP_URL } from "./_layout"

interface ConfirmationItem {
  name: string
  quantity: number
  unitPriceCents: number
  discountCents: number
}

interface ConfirmationPriceSheet {
  subtotalCents: number
  discountCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
}

export interface OrderConfirmationData {
  to: string
  orderNumber: string
  address: CheckoutAddress
  items: ConfirmationItem[]
  priceSheet: ConfirmationPriceSheet
  shippingMethod: ShippingMethod
}

function fmtDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

const SHIPPING_LABELS: Record<ShippingMethod, string> = {
  standard: "USPS Standard",
  express: "DHL Express",
  overnight: "DHL Express",
  pickup: "Pick Up in Store",
}

export function buildOrderConfirmationHtml(
  data: OrderConfirmationData,
): string {
  const { orderNumber, address, items, priceSheet, shippingMethod } = data
  const isPickup = shippingMethod === "pickup"

  const pickupHoursRows = PICKUP_HOURS.map(
    (line) =>
      `<tr><td style="font-size:12px;color:#374151;padding:1px 0;">${line.days}</td><td style="font-size:12px;color:#374151;text-align:right;">${line.hours}</td></tr>`,
  ).join("")

  const fulfillmentBlock = isPickup
    ? `<div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Ready for pickup at</p>
        <p style="margin:0 0 12px;font-size:13px;color:#374151;line-height:1.6;">${PICKUP_ADDRESS}</p>
        <table width="100%" cellpadding="0" cellspacing="0">${pickupHoursRows}</table>
        <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">${PICKUP_HOURS_NOTE}</p>
        <p style="margin:12px 0 0;font-size:12px;color:#374151;line-height:1.5;">
          Pick up within <strong>${PICKUP_WINDOW_DAYS} calendar days</strong> of placing your order.
          Uncollected orders are automatically canceled and refunded.
        </p>
      </div>`
    : `<div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Shipping to</p>
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
          ${address.fullName}<br>
          ${address.streetLine1}
          ${address.streetLine2 ? `<br>${address.streetLine2}` : ""}
          <br>${address.city}, ${address.state} ${address.zip}
        </p>
        <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">${SHIPPING_LABELS[shippingMethod]}</p>
      </div>`

  const introCopy = isPickup
    ? `Thank you for your order! We'll have it ready for pickup at our Ontario store. You have ${PICKUP_WINDOW_DAYS} calendar days to collect it during our posted hours.`
    : "Thank you for your order! We're preparing it now and will send tracking information as soon as your package ships."

  const itemRows = items
    .map((item) => {
      const lineTotal = item.unitPriceCents * item.quantity - item.discountCents
      return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;">
            ${item.name} × ${item.quantity}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;text-align:right;white-space:nowrap;">
            ${fmtDollars(lineTotal)}
            ${item.discountCents > 0 ? `<br><span style="font-size:11px;color:#6b7280;">${fmtDollars(item.discountCents)} pro discount</span>` : ""}
          </td>
        </tr>`
    })
    .join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation — ${orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:32px 32px 24px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-.5px;">
                Metamorfosis Beauty
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#9ca3af;">
                Your order is confirmed
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Order number</p>
              <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#111827;letter-spacing:.5px;">
                ${orderNumber}
              </p>

              <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111827;">
                Hi ${address.fullName.split(" ")[0]},
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.6;">
                ${introCopy}
              </p>

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <thead>
                  <tr>
                    <th style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;padding-bottom:8px;border-bottom:1px solid #e5e7eb;text-align:left;">
                      Item
                    </th>
                    <th style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;padding-bottom:8px;border-bottom:1px solid #e5e7eb;text-align:right;">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="font-size:13px;color:#6b7280;padding:4px 0;">Subtotal</td>
                  <td style="font-size:13px;color:#6b7280;text-align:right;">${fmtDollars(priceSheet.subtotalCents)}</td>
                </tr>
                ${
                  priceSheet.discountCents > 0
                    ? `<tr>
                  <td style="font-size:13px;color:#059669;padding:4px 0;">Pro discount</td>
                  <td style="font-size:13px;color:#059669;text-align:right;">−${fmtDollars(priceSheet.discountCents)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="font-size:13px;color:#6b7280;padding:4px 0;">Shipping</td>
                  <td style="font-size:13px;color:#6b7280;text-align:right;">
                    ${priceSheet.shippingCents === 0 ? "FREE" : fmtDollars(priceSheet.shippingCents)}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6b7280;padding:4px 0;">Tax</td>
                  <td style="font-size:13px;color:#6b7280;text-align:right;">${fmtDollars(priceSheet.taxCents)}</td>
                </tr>
                <tr>
                  <td style="font-size:15px;font-weight:700;color:#111827;padding:12px 0 0;border-top:1px solid #e5e7eb;">
                    Total
                  </td>
                  <td style="font-size:15px;font-weight:700;color:#111827;text-align:right;padding:12px 0 0;border-top:1px solid #e5e7eb;">
                    ${fmtDollars(priceSheet.totalCents)}
                  </td>
                </tr>
              </table>

              <!-- Fulfillment (pickup or shipping) -->
              ${fulfillmentBlock}

              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                Questions? Reply to this email or write us at
                <a href="mailto:${EMAIL_ADDRESSES.customerSupport}" style="color:#111827;">${EMAIL_ADDRESSES.customerSupport}</a>.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f4f6;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                © ${new Date().getFullYear()} Metamorfosis Beauty Supply LLC · Ontario, CA
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildOrderConfirmationText(
  data: OrderConfirmationData,
): string {
  const { orderNumber, address, items, priceSheet, shippingMethod } = data
  const isPickup = shippingMethod === "pickup"

  const fulfillmentLines = isPickup
    ? [
        `READY FOR PICKUP AT`,
        PICKUP_ADDRESS,
        ...pickupHoursText(),
        PICKUP_HOURS_NOTE,
        `Pick up within ${PICKUP_WINDOW_DAYS} calendar days or the order is auto-canceled and refunded.`,
      ]
    : [
        `SHIPPING TO`,
        `${address.fullName}`,
        `${address.streetLine1}${address.streetLine2 ? `, ${address.streetLine2}` : ""}`,
        `${address.city}, ${address.state} ${address.zip}`,
        `${SHIPPING_LABELS[shippingMethod]}`,
      ]

  const lines: string[] = [
    `Metamorfosis Beauty — Order Confirmed`,
    ``,
    `Order: ${orderNumber}`,
    ``,
    `Hi ${address.fullName.split(" ")[0]},`,
    isPickup
      ? `Thank you for your order! Pick up within ${PICKUP_WINDOW_DAYS} calendar days at our Ontario store.`
      : `Thank you for your order! We're preparing it now.`,
    ``,
    `ITEMS`,
    ...items.map(
      (i) =>
        `• ${i.name} × ${i.quantity} — ${fmtDollars(i.unitPriceCents * i.quantity - i.discountCents)}`,
    ),
    ``,
    `TOTALS`,
    `Subtotal: ${fmtDollars(priceSheet.subtotalCents)}`,
    priceSheet.discountCents > 0
      ? `Pro discount: -${fmtDollars(priceSheet.discountCents)}`
      : "",
    `Shipping: ${priceSheet.shippingCents === 0 ? "FREE" : fmtDollars(priceSheet.shippingCents)}`,
    `Tax: ${fmtDollars(priceSheet.taxCents)}`,
    `Total: ${fmtDollars(priceSheet.totalCents)}`,
    ``,
    ...fulfillmentLines,
    ``,
    `Questions? Email us at ${EMAIL_ADDRESSES.customerSupport} or visit ${APP_URL}`,
  ]
  return lines.filter((l) => l !== undefined).join("\n")
}
