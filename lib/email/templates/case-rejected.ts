import { emailIntro, emailShell } from "./_layout"

export interface CaseRejectedData {
  to: string
  customerName: string
  adminNotes: string
}

export function buildCaseRejectedHtml(data: CaseRejectedData): string {
  const body = `${emailIntro(
    "Update on your return request",
    `Hi ${data.customerName}, we've reviewed your return request and are unable to approve it at this time.`,
  )}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1f1a0f;border-radius:8px;border:1px solid #3a311a;margin:0 0 8px;">
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#fbbf24;">Details</p>
    <p style="margin:0;font-size:13px;color:#d6c08a;line-height:1.6;">${data.adminNotes}</p>
  </td></tr>
</table>`
  return emailShell("Update on your return request", body)
}

export function buildCaseRejectedText(data: CaseRejectedData): string {
  return `Hi ${data.customerName},

We've reviewed your return request and are unable to approve it at this time.

Details: ${data.adminNotes}

If you have questions, just reply to this email.

— Metamorfosis Beauty Supply`
}
