import "server-only"

import { FROM, getResend, REPLY_TO } from "./resend"
import {
  buildPickupScheduledHtml,
  buildPickupScheduledText,
  type PickupScheduledEmailData,
} from "./templates/pickup-scheduled"
import { getStoreOwnerNotificationEmail } from "@/lib/shippo/ship-from"

export async function sendPickupScheduled(
  data: PickupScheduledEmailData,
): Promise<void> {
  const to = getStoreOwnerNotificationEmail()
  const subject = `Carrier pickup scheduled — ${data.pickupDate}`

  if (!process.env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY not set — skipping "${subject}"`)
    return
  }

  const { error } = await getResend().emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject,
    html: buildPickupScheduledHtml(data),
    text: buildPickupScheduledText(data),
  })

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
}
