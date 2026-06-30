import "server-only"

export interface PurchasedLabel {
  transactionId: string
  trackingNumber: string | null
  trackingUrl: string | null
  labelUrl: string | null
  carrier: string | null
  serviceName: string | null
}

function extractShippoMessages(data: Record<string, unknown>): string {
  const messages = data.messages
  if (!Array.isArray(messages)) return "unknown error"
  return messages
    .map((m) => {
      if (m && typeof m === "object" && "text" in m) {
        return String((m as { text?: string }).text ?? "")
      }
      return ""
    })
    .filter(Boolean)
    .join("; ")
}

/**
 * Buys a shipping label from a previously-quoted Shippo rate via
 * transaction.create. Throws with a descriptive message on failure.
 */
export async function purchaseLabel(rateId: string): Promise<PurchasedLabel> {
  const apiKey = process.env.SHIPPO_API_KEY
  if (!apiKey) throw new Error("SHIPPO_API_KEY is not set")

  const res = await fetch("https://api.goshippo.com/transactions/", {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rate: rateId,
      label_file_type: "PDF_4x6",
      async: false,
    }),
  })

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (!res.ok) {
    const detail = extractShippoMessages(data) || JSON.stringify(data)
    console.error("[purchaseLabel] Shippo HTTP error:", res.status, data)
    throw new Error(`Shippo transaction failed: ${detail}`)
  }

  if (data.status !== "SUCCESS") {
    const messages = extractShippoMessages(data)
    console.error("[purchaseLabel] Shippo label not SUCCESS:", data)
    throw new Error(`Shippo could not buy the label: ${messages}`)
  }

  const rate =
    data.rate && typeof data.rate === "object"
      ? (data.rate as Record<string, unknown>)
      : null
  const servicelevel =
    rate?.servicelevel && typeof rate.servicelevel === "object"
      ? (rate.servicelevel as Record<string, unknown>)
      : null

  return {
    transactionId: String(data.object_id ?? ""),
    trackingNumber: (data.tracking_number as string | null) ?? null,
    trackingUrl: (data.tracking_url_provider as string | null) ?? null,
    labelUrl: (data.label_url as string | null) ?? null,
    carrier: (rate?.provider as string | null) ?? null,
    serviceName: (servicelevel?.name as string | null) ?? null,
  }
}

/**
 * Fetches an existing label URL from a Shippo transaction (for reprint).
 */
export async function getTransactionLabelUrl(
  transactionId: string,
): Promise<{ labelUrl: string | null; trackingNumber: string | null }> {
  const apiKey = process.env.SHIPPO_API_KEY
  if (!apiKey) throw new Error("SHIPPO_API_KEY is not set")

  const res = await fetch(
    `https://api.goshippo.com/transactions/${transactionId}/`,
    {
      headers: { Authorization: `ShippoToken ${apiKey}` },
    },
  )

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    const detail = extractShippoMessages(data) || JSON.stringify(data)
    console.error(
      "[getTransactionLabelUrl] Shippo HTTP error:",
      res.status,
      data,
    )
    throw new Error(`Could not fetch label: ${detail}`)
  }

  if (data.status !== "SUCCESS") {
    const messages = extractShippoMessages(data)
    throw new Error(`Label is not available: ${messages}`)
  }

  return {
    labelUrl: (data.label_url as string | null) ?? null,
    trackingNumber: (data.tracking_number as string | null) ?? null,
  }
}
