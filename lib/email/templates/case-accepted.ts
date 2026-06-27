import { emailIntro, emailShell } from "./_layout"

export interface CaseAcceptedData {
  to: string
  customerName: string
  labelUrl: string
  /** From the Shippo rate (rate.provider) — never hardcoded. */
  carrierName: string
  estimatedDays?: number | null
}

export function buildCaseAcceptedHtml(data: CaseAcceptedData): string {
  const eta = data.estimatedDays
    ? ` Estimated transit time is about ${data.estimatedDays} business day(s).`
    : ""
  const body = `${emailIntro(
    "Your return has been approved",
    `Hi ${data.customerName}, your return has been approved. Please print the attached shipping label and drop it off at a ${data.carrierName} location.${eta} Your refund will be processed once the item is received and inspected.`,
  )}
<a href="${data.labelUrl}" style="display:inline-block;background:#f5f5f7;color:#0f0f13;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">Download return label</a>`
  return emailShell("Your return has been approved", body)
}

export function buildCaseAcceptedText(data: CaseAcceptedData): string {
  const eta = data.estimatedDays
    ? ` Estimated transit time is about ${data.estimatedDays} business day(s).`
    : ""
  return `Hi ${data.customerName},

Your return has been approved. Please print the attached shipping label and drop it off at a ${data.carrierName} location.${eta} Your refund will be processed once the item is received and inspected.

Download return label: ${data.labelUrl}

— Metamorfosis Beauty Supply`
}
