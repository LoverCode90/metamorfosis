import "server-only"

import { FROM, getResend, REPLY_TO } from "./resend"
import {
  buildCaseSubmittedHtml,
  buildCaseSubmittedText,
  type CaseSubmittedData,
} from "./templates/case-submitted"
import {
  buildCaseAcceptedHtml,
  buildCaseAcceptedText,
  type CaseAcceptedData,
} from "./templates/case-accepted"
import {
  buildCaseApprovedHtml,
  buildCaseApprovedText,
  type CaseApprovedData,
} from "./templates/case-approved"
import {
  buildCaseRejectedHtml,
  buildCaseRejectedText,
  type CaseRejectedData,
} from "./templates/case-rejected"
import {
  buildCaseFraudHtml,
  buildCaseFraudText,
  type CaseFraudData,
} from "./templates/case-fraud"
import {
  buildReturnUneconomicalHtml,
  buildReturnUneconomicalText,
  type ReturnUneconomicalData,
} from "./templates/return-uneconomical"

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

export async function sendCaseSubmitted(
  data: CaseSubmittedData,
): Promise<void> {
  await dispatch({
    to: data.to,
    subject: "We received your return request — Metamorfosis Beauty",
    html: buildCaseSubmittedHtml(data),
    text: buildCaseSubmittedText(data),
  })
}

export async function sendCaseAccepted(data: CaseAcceptedData): Promise<void> {
  await dispatch({
    to: data.to,
    subject: "Your return has been approved — here's your shipping label",
    html: buildCaseAcceptedHtml(data),
    text: buildCaseAcceptedText(data),
  })
}

export async function sendCaseApproved(data: CaseApprovedData): Promise<void> {
  await dispatch({
    to: data.to,
    subject: "Your case has been approved — Metamorfosis",
    html: buildCaseApprovedHtml(data),
    text: buildCaseApprovedText(data),
  })
}

export async function sendCaseRejected(data: CaseRejectedData): Promise<void> {
  await dispatch({
    to: data.to,
    subject: "Update on your case — Metamorfosis",
    html: buildCaseRejectedHtml(data),
    text: buildCaseRejectedText(data),
  })
}

export async function sendCaseFraud(data: CaseFraudData): Promise<void> {
  await dispatch({
    to: data.to,
    subject: "Your return request has been denied — fraud attempt detected",
    html: buildCaseFraudHtml(data),
    text: buildCaseFraudText(data),
  })
}

export async function sendReturnUneconomical(
  data: ReturnUneconomicalData,
): Promise<void> {
  await dispatch({
    to: data.to,
    subject: "We're unable to process your return — Metamorfosis Beauty",
    html: buildReturnUneconomicalHtml(data),
    text: buildReturnUneconomicalText(data),
  })
}
