import { emailIntro, emailShell } from "./_layout"
import { EMAIL_ADDRESSES } from "@/lib/email/addresses"

export interface CaseFraudData {
  to: string
  customerName: string
  itemDescription: string
}

export function buildCaseFraudHtml(data: CaseFraudData): string {
  const body = `${emailIntro(
    "Your return request has been denied",
    `Hi ${data.customerName}, due to inconsistencies between the submitted photos and the actual condition of your item (${data.itemDescription}), your request has been denied. If you believe this is an error, please contact us at ${EMAIL_ADDRESSES.customerSupport}.`,
  )}
<p style="margin:0;font-size:14px;color:#8b8b9a;line-height:1.6;">
  If you wish to have your item returned to you, you must pay the return shipping label cost. Failure to respond within 14 days means the item becomes property of the business.
</p>`
  return emailShell("Your return request has been denied", body)
}

export function buildCaseFraudText(data: CaseFraudData): string {
  return `Hi ${data.customerName},

Due to inconsistencies between the submitted photos and the actual condition of your item (${data.itemDescription}), your request has been denied. If you believe this is an error, please contact us at ${EMAIL_ADDRESSES.customerSupport}.

If you wish to have your item returned to you, you must pay the return shipping label cost. Failure to respond within 14 days means the item becomes property of the business.

— Metamorfosis Beauty Supply`
}
