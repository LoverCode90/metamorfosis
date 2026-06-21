/** Supported shipping methods matching the DB enum. */
export type ShippingMethod = "standard" | "express" | "overnight" | "pickup"

export interface ShippingRate {
  method: ShippingMethod
  label: string
  description: string
  amountCents: number
  display: string
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
  shippingMethod: ShippingMethod
  address: CheckoutAddress
  termsAccepted: boolean
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
  item?: string
  available?: number
}

export type PlaceOrderResponse = PlaceOrderResult | PlaceOrderError
