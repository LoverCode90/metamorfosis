import { emailIntro, emailShell } from "./_layout"
import {
  CARRIER_PICKUP_SLOTS,
  type CarrierPickupSlotKey,
} from "@/lib/admin/pickup-slots"
import { formatPacificDateTime } from "@/lib/admin/pacific-datetime"
import type { ScheduledPickupResult } from "@/lib/admin/carrier-pickup-types"
import { PICKUP_ADDRESS } from "@/lib/checkout/pickup"

export interface PickupScheduledEmailData {
  pickupDate: string
  slotKey: CarrierPickupSlotKey
  instructions?: string
  results: ScheduledPickupResult[]
}

function formatStatusBadge(status: string): string {
  const normalized = status.toUpperCase()
  const color =
    normalized === "CONFIRMED"
      ? "#34d399"
      : normalized === "ERROR"
        ? "#f87171"
        : "#fbbf24"
  return `<span style="color:${color};font-weight:600;">${normalized}</span>`
}

function buildResultRows(results: ScheduledPickupResult[]): string {
  return results
    .map((result) => {
      const confirmed =
        result.confirmedStartTime && result.confirmedEndTime
          ? `<p style="margin:4px 0 0;font-size:13px;color:#8b8b9a;">Confirmed window: ${formatPacificDateTime(result.confirmedStartTime)} – ${formatPacificDateTime(result.confirmedEndTime)}</p>`
          : ""
      const code = result.confirmationCode
        ? `<p style="margin:4px 0 0;font-size:13px;color:#f5f5f7;">Confirmation code: <strong>${result.confirmationCode}</strong></p>`
        : ""

      return `<div style="margin:0 0 16px;padding:16px;border:1px solid #2e2e3a;border-radius:10px;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#f5f5f7;">${result.carrierLabel} · ${result.orderCount} package${result.orderCount === 1 ? "" : "s"}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#8b8b9a;">Status: ${formatStatusBadge(result.status)}</p>
        ${confirmed}
        ${code}
      </div>`
    })
    .join("")
}

export function buildPickupScheduledHtml(
  data: PickupScheduledEmailData,
): string {
  const slot = CARRIER_PICKUP_SLOTS[data.slotKey]
  const instructionsBlock = data.instructions?.trim()
    ? `<p style="margin:0 0 16px;font-size:13px;color:#8b8b9a;line-height:1.6;"><strong style="color:#f5f5f7;">Instructions for the driver:</strong> ${data.instructions.trim()}</p>`
    : ""

  const body = `${emailIntro(
    "Carrier pickup scheduled",
    `Hi Alexandra, a carrier pickup has been scheduled for <strong>${data.pickupDate}</strong> (${slot.label}) at ${PICKUP_ADDRESS}.`,
  )}
  ${instructionsBlock}
  ${buildResultRows(data.results)}
  <p style="margin:0;font-size:12px;color:#52525e;">If you need to change or cancel, contact the carrier directly with the confirmation code above.</p>`

  return emailShell("Carrier pickup scheduled", body)
}

export function buildPickupScheduledText(
  data: PickupScheduledEmailData,
): string {
  const slot = CARRIER_PICKUP_SLOTS[data.slotKey]
  const lines = [
    `Hi Alexandra,`,
    ``,
    `A carrier pickup has been scheduled for ${data.pickupDate} (${slot.label}) at ${PICKUP_ADDRESS}.`,
    ``,
  ]

  if (data.instructions?.trim()) {
    lines.push(`Instructions: ${data.instructions.trim()}`, ``)
  }

  for (const result of data.results) {
    lines.push(
      `${result.carrierLabel} — ${result.orderCount} package(s)`,
      `Status: ${result.status}`,
    )
    if (result.confirmationCode) {
      lines.push(`Confirmation code: ${result.confirmationCode}`)
    }
    if (result.confirmedStartTime && result.confirmedEndTime) {
      lines.push(
        `Confirmed: ${formatPacificDateTime(result.confirmedStartTime)} – ${formatPacificDateTime(result.confirmedEndTime)}`,
      )
    }
    lines.push("")
  }

  lines.push("— Metamorfosis Beauty Supply")
  return lines.join("\n")
}
