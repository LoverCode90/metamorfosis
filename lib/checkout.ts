// ---------------------------------------------------------------------------
// Domain types, catalog data & pure helpers for the Metamorfosis Lab store.
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

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export interface Product {
  id: string
  name: string
  variant: string
  image: string
  unitPrice: number
  /** Per-item professional discount, in dollars. 0 = none. */
  discountPerItem: number
  /** Remaining units — drives the low-stock warning. */
  stock: number
  /** Pro-only items require license verification before checkout completes. */
  isProfessional?: boolean
}

export interface CartItem extends Product {
  quantity: number
}

export const INITIAL_CART: CartItem[] = [
  {
    id: "lab-noir-7n",
    name: "Lab Noir — Permanent Crème",
    variant: "Shade 7N · Natural Blonde",
    image: "/hair-color-product.png",
    unitPrice: 29,
    discountPerItem: 2,
    stock: 24,
    quantity: 2,
    isProfessional: true,
  },
  {
    id: "oxidant-20",
    name: "Oxidant Activator",
    variant: "20 Vol · 1000ml",
    image: "/products/oxidant-activator.png",
    unitPrice: 18,
    discountPerItem: 0,
    stock: 3,
    quantity: 1,
  },
  {
    id: "bond-serum",
    name: "Bond Repair Serum",
    variant: "Step 1 · 100ml",
    image: "/products/bond-repair-serum.png",
    unitPrice: 34,
    discountPerItem: 3,
    stock: 25,
    quantity: 1,
  },
]

export const RELATED_PRODUCTS: Product[] = [
  {
    id: "color-mask",
    name: "Color Sealing Mask",
    variant: "Post-Color · 200ml",
    image: "/products/color-sealing-mask.png",
    unitPrice: 26,
    discountPerItem: 0,
    stock: 40,
  },
  {
    id: "tint-brush",
    name: "Tint Brush Set",
    variant: "Pro · 3-piece",
    image: "/products/tint-brush-set.png",
    unitPrice: 22,
    discountPerItem: 0,
    stock: 18,
  },
  {
    id: "barrier-cream",
    name: "Scalp Protect Barrier",
    variant: "Pre-Color · 75ml",
    image: "/products/scalp-barrier-cream.png",
    unitPrice: 14,
    discountPerItem: 0,
    stock: 60,
  },
  {
    id: "pigment-drops",
    name: "Pigment Booster Drops",
    variant: "Custom Mix · 30ml",
    image: "/products/pigment-booster.png",
    unitPrice: 19,
    discountPerItem: 0,
    stock: 12,
  },
]

export const SHIPPING_DESTINATION = "United States (US)"

export const TAX_RATE = 0.08

// ---------------------------------------------------------------------------
// Pure helpers — no side effects, trivial to unit test.
// ---------------------------------------------------------------------------

const round2 = (n: number) => Math.round(n * 100) / 100

export interface Totals {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  itemCount: number
}

export function computeTotals(items: CartItem[]): Totals {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const discount = items.reduce(
    (sum, i) => sum + i.discountPerItem * i.quantity,
    0,
  )
  const shipping = 0
  const tax = round2((subtotal - discount) * TAX_RATE)
  const total = round2(subtotal - discount + shipping + tax)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  return { subtotal, discount, shipping, tax, total, itemCount }
}

export function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

// ---------------------------------------------------------------------------
// Order generation
// ---------------------------------------------------------------------------

export interface Order {
  number: string
  trackingId: string
  email: string
  shipName: string
  shipAddress: string
  items: CartItem[]
  totals: Totals
  /** Epoch ms when the order was placed — drives the cancellation window. */
  placedAt: number
}

/** Minutes the autonomous-refund cancellation window stays open. */
export const CANCEL_WINDOW_MINUTES = 120

function randomDigits(length: number) {
  let out = ""
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10)
  return out
}

function randomAlphaNum(length: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < length; i++)
    out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export function createOrder(
  items: CartItem[],
  details: { email: string; shipName: string; shipAddress: string },
): Order {
  return {
    number: `ORD-2026-${randomDigits(5)}`,
    trackingId: `SHP-${randomAlphaNum(10)}`,
    email: details.email,
    shipName: details.shipName,
    shipAddress: details.shipAddress,
    items,
    totals: computeTotals(items),
    placedAt: Date.now(),
  }
}

// Variant flags drive the toggleable payment demo states.
export type PaymentVariant = "default" | "error" | "expired"

// View identifiers for the unified multi-view state machine.
export type StoreView =
  | "home"
  | "products"
  | "product-detail"
  | "academy"
  | "about"
  | "cart"
  | "checkout"
  | "confirmation"
  | "verify"
  | "wishlist"
  | "profile"
  | "tracking"
  | "login"
  | "signup"

// ---------------------------------------------------------------------------
// Profile / account
// ---------------------------------------------------------------------------

/**
 * Three-state professional verification:
 *  - "regular"  → standard shopper, uploads enabled
 *  - "pending"  → license submitted; uploads disabled, email-notify banner
 *  - "verified" → professional unlocked (B2B layouts + pro pricing)
 */
export type VerificationStatus = "regular" | "pending" | "verified"

export interface SavedAddress {
  fullName: string
  line1: string
  city: string
  region: string
  postalCode: string
  country: string
}

export interface UserProfile {
  name: string
  email: string
  location: string
  bio: string
  avatar: string
  status: VerificationStatus
}

/** Per-region shipping table — drives the checkout recalculation flow. */
export const SHIPPING_TABLE: Record<string, number> = {
  "United States": 6,
  Canada: 12,
  "United Kingdom": 14,
  Australia: 18,
  Germany: 14,
}

export function shippingFor(country: string): number {
  return SHIPPING_TABLE[country] ?? 15
}

/** Totals variant that accepts an explicit shipping cost (location-aware). */
export function computeTotalsWithShipping(
  items: CartItem[],
  shipping: number,
): Totals {
  const base = computeTotals(items)
  const total = round2(base.subtotal - base.discount + shipping + base.tax)
  return { ...base, shipping, total }
}
