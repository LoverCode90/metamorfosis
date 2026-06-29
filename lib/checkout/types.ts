/** DB `shipping_method` enum. Retained for the order column + email labels. */
export type ShippingMethod = "standard" | "express" | "overnight" | "pickup"

/**
 * A live carrier rate returned by Shippo (snake_case = API response shape).
 * `shippo_rate_id` is null for in-store pickup (no carrier rate to re-fetch).
 */
export interface LiveShippingRate {
  carrier: string
  service_name: string
  amount_cents: number
  estimated_days: number | null
  shippo_rate_id: string | null
}

export interface CheckoutAddress {
  fullName: string
  email: string
  phone: string
  streetLine1: string
  streetLine2: string
  city: string
  state: string
  zip: string
  country: "US"
}

/**
 * What the client sends to /api/checkout/validate-payment.
 * No price fields — server fetches from Square.
 */
export interface CheckoutPayload {
  items: { variationId: string; quantity: number }[]
  /**
   * Shippo rate id the customer selected; the server re-fetches its amount.
   * null = in-store pickup (free, no carrier rate).
   */
  shippoRateId: string | null
  address: CheckoutAddress
  /** Non-returnable (chemical) products warning acknowledgment. */
  termsAccepted: boolean
  /** 2.6% card processing fee acknowledgment (step-payment checkbox). */
  surchargeConsented: boolean
  /** Save card for future purchases checkbox. */
  saveCardConsented?: boolean
  turnstileToken: string
  /** Square card nonce from Web Payments SDK */
  sourceId: string
  /** Guests only — email for order confirmation */
  guestEmail?: string
}

/** Server-computed price breakdown returned to client before/after charge. */
export interface PriceSheet {
  items: {
    variationId: string
    name: string
    quantity: number
    unitPriceCents: number
    discountCents: number
    lineTotalCents: number
  }[]
  subtotalCents: number
  discountCents: number
  shippingCents: number
  taxCents: number
  surchargeCents: number
  totalCents: number
}

export interface PlaceOrderResult {
  ok: true
  orderId: string
  orderNumber: string
  totalCents: number
}

export interface PlaceOrderError {
  ok: false
  error: string
  code?:
    | "OUT_OF_STOCK"
    | "TAMPER"
    | "PAYMENT_FAILED"
    | "UNAUTHORIZED"
    | "TURNSTILE"
    | "RATE_LIMITED"
    | "CONSENT_REQUIRED"
  item?: string
  available?: number
}

export type PlaceOrderResponse = PlaceOrderResult | PlaceOrderError
