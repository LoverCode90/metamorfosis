import "server-only"

interface ShippoRate {
  object_id: string
  amount: string
  provider?: string
  estimated_days?: number | null
}

interface ShippoLabel {
  label_url?: string
  object_id?: string
  /** Carrier name from the chosen Shippo rate (e.g. "USPS", "UPS"). */
  carrier?: string
  estimatedDays?: number | null
}

export async function createReturnLabel(
  shippoTransactionId: string,
): Promise<ShippoLabel> {
  const apiKey = process.env.SHIPPO_API_KEY
  if (!apiKey) throw new Error("SHIPPO_API_KEY is not set")

  // As per Shippo docs, passing 'return_of' to /v1/shipments/ creates a return shipment.
  // Wait, actually, Shippo docs say we can just POST to /v1/shipments/ with extra: { is_return: true }
  // Let's get the original transaction first to find the shipment ID
  const txRes = await fetch(
    `https://api.goshippo.com/transactions/${shippoTransactionId}`,
    {
      headers: { Authorization: `ShippoToken ${apiKey}` },
    },
  )
  if (!txRes.ok) throw new Error("Failed to fetch original shippo transaction")
  const txData = await txRes.json()

  // Create a return shipment by flipping from/to and using the same parcel.
  // Or we can just use the shippo return API if we know it.
  // Let's create a shipment with return_of. wait, no, the simplest is to just swap the addresses.
  // Actually, wait, Shippo's exact feature for returns uses the "returnOf" field or similar?
  // Let's just swap addresses to be extremely safe!

  const shippmentRes = await fetch(
    `https://api.goshippo.com/shipments/${txData.shipment}`,
    {
      headers: { Authorization: `ShippoToken ${apiKey}` },
    },
  )
  if (!shippmentRes.ok)
    throw new Error("Failed to fetch original shippo shipment")
  const shipmentData = await shippmentRes.json()

  // New shipment
  const newShipmentBody = {
    address_from: shipmentData.address_to,
    address_to: shipmentData.address_from,
    parcels: shipmentData.parcels,
    extra: {
      is_return: true,
    },
    async: false,
  }

  const createShipRes = await fetch(`https://api.goshippo.com/shipments/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newShipmentBody),
  })

  if (!createShipRes.ok) {
    throw new Error("Failed to create return shipment")
  }
  const newShipmentData = await createShipRes.json()

  // Get the cheapest rate
  const rates = newShipmentData.rates || []
  if (rates.length === 0) {
    throw new Error("No return rates available from Shippo")
  }

  const cheapestRate = (rates as ShippoRate[]).reduce(
    (min: ShippoRate, rate: ShippoRate) =>
      parseFloat(rate.amount) < parseFloat(min.amount) ? rate : min,
    rates[0],
  )

  // Purchase label
  const purchaseRes = await fetch(`https://api.goshippo.com/transactions/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rate: cheapestRate.object_id,
      label_file_type: "PDF",
    }),
  })

  if (!purchaseRes.ok) {
    throw new Error("Failed to purchase return label")
  }

  const purchaseData = await purchaseRes.json()
  return {
    ...purchaseData,
    carrier: cheapestRate.provider,
    estimatedDays: cheapestRate.estimated_days ?? null,
  }
}
