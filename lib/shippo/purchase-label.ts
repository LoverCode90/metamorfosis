import "server-only"

export interface PurchasedLabel {
  transactionId: string
  trackingNumber: string | null
  trackingUrl: string | null
  labelUrl: string | null
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
      label_file_type: "PDF",
      async: false,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`Shippo transaction failed: ${JSON.stringify(data)}`)
  }
  if (data.status !== "SUCCESS") {
    const messages = Array.isArray(data.messages)
      ? data.messages.map((m: { text?: string }) => m.text).join("; ")
      : "unknown error"
    throw new Error(`Shippo could not buy the label: ${messages}`)
  }

  return {
    transactionId: data.object_id,
    trackingNumber: data.tracking_number ?? null,
    trackingUrl: data.tracking_url_provider ?? null,
    labelUrl: data.label_url ?? null,
  }
}
