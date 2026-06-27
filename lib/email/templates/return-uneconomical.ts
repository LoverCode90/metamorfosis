import { emailIntro, emailShell } from "./_layout"

export interface ReturnUneconomicalData {
  to: string
  customerName: string
  itemName: string
  itemCents: number
  shippingCents: number
}

function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function buildReturnUneconomicalHtml(
  data: ReturnUneconomicalData,
): string {
  const body = `${emailIntro(
    "We're unable to process your return",
    `Hi ${data.customerName}, unfortunately the cost of return shipping (${usd(
      data.shippingCents,
    )}) exceeds the value of your item ${data.itemName} (${usd(
      data.itemCents,
    )}), making a return economically unfeasible.`,
  )}
<p style="margin:0;font-size:14px;color:#8b8b9a;line-height:1.6;">
  As stated in our Terms &amp; Conditions, items where return shipping exceeds item value are not eligible for return. We apologize for the inconvenience.
</p>`
  return emailShell("We're unable to process your return", body)
}

export function buildReturnUneconomicalText(
  data: ReturnUneconomicalData,
): string {
  return `Hi ${data.customerName},

Unfortunately the cost of return shipping (${usd(data.shippingCents)}) exceeds the value of your item ${data.itemName} (${usd(data.itemCents)}), making a return economically unfeasible.

As stated in our Terms & Conditions, items where return shipping exceeds item value are not eligible for return. We apologize for the inconvenience.

— Metamorfosis Beauty Supply`
}
