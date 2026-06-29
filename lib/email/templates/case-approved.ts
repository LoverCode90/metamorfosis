import { emailIntro, emailShell } from "./_layout"

export interface CaseApprovedData {
  to: string
  customerName: string
  /** Optional resolution message written by the admin. */
  resolution?: string
}

const NEXT_STEPS =
  "You'll receive a follow-up email shortly with instructions for the next steps — either a prepaid return label or details about your refund."

export function buildCaseApprovedHtml(data: CaseApprovedData): string {
  const note = data.resolution
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1f14;border-radius:8px;border:1px solid #1a3a26;margin:0 0 8px;">
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#34d399;">Note from our team</p>
    <p style="margin:0;font-size:13px;color:#8ad6a8;line-height:1.6;">${data.resolution}</p>
  </td></tr>
</table>`
    : ""

  const body = `${emailIntro(
    "Your case has been approved",
    `Hi ${data.customerName}, good news — we've reviewed your case and approved it. ${NEXT_STEPS}`,
  )}
${note}`
  return emailShell("Your case has been approved", body)
}

export function buildCaseApprovedText(data: CaseApprovedData): string {
  const note = data.resolution
    ? `\n\nNote from our team: ${data.resolution}`
    : ""
  return `Hi ${data.customerName},

Good news — we've reviewed your case and approved it.

${NEXT_STEPS}${note}

— Metamorfosis Beauty Supply`
}
