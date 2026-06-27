import { emailIntro, emailShell } from "./_layout"

export interface CaseSubmittedData {
  to: string
  customerName: string
  caseId: string
  orderId: string
  reason: string
}

export function buildCaseSubmittedHtml(data: CaseSubmittedData): string {
  const body = `${emailIntro(
    "We received your request",
    `Hi ${data.customerName}, we've received your return request and our team will review it shortly. You'll receive another email once it has been reviewed.`,
  )}
<p style="margin:0;font-size:13px;color:#8b8b9a;">Case reference: ${data.caseId}</p>`
  return emailShell("Return request received", body)
}

export function buildCaseSubmittedText(data: CaseSubmittedData): string {
  return `Hi ${data.customerName},

We've received your return request and our team will review it shortly. You'll receive another email once it has been reviewed.

Case reference: ${data.caseId}

— Metamorfosis Beauty Supply`
}
