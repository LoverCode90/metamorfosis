// ---------------------------------------------------------------------------
// Domain types & mock data for the checkout flow.
// Keeping data/logic isolated from UI keeps components dumb and testable.
// ---------------------------------------------------------------------------

export type CheckoutStepId = "cart" | "info" | "shipping" | "payment"

export interface CheckoutStep {
  id: CheckoutStepId
  label: string
}

export const CHECKOUT_STEPS: CheckoutStep[] = [
  { id: "cart", label: "Cart" },
  { id: "info", label: "Info" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
]

export interface LineItem {
  id: string
  name: string
  variant: string
  image: string
  unitPrice: number
  discountPerItem: number
  quantity: number
}

export const ORDER_ITEMS: LineItem[] = [
  {
    id: "lab-noir-7n",
    name: "Lab Noir — Permanent Crème",
    variant: "Shade 7N · Natural Blonde",
    image: "/hair-color-product.png",
    unitPrice: 29,
    discountPerItem: 2,
    quantity: 2,
  },
]

export const SHIPPING_DESTINATION = "United States (US)"

// Pure pricing helper — no side effects, trivial to unit test.
export function computeTotals(items: LineItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const discount = items.reduce(
    (sum, i) => sum + i.discountPerItem * i.quantity,
    0,
  )
  const shipping = 0
  const total = subtotal - discount + shipping
  return { subtotal, discount, shipping, total }
}

export function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

// Variant flags drive the toggleable demo states described in the brief.
export type PaymentVariant = "default" | "error" | "expired"
