/**
 * Shared domain types for the Metamorfosis storefront.
 * Phase 3+ replaces the v0 mock variants with Supabase-synced equivalents.
 */

// ── Primitives ────────────────────────────────────────────────────────────────

/** Integer amount in US cents. Always an integer — never a float. */
export type MoneyCents = number

/** Supported locale codes. */
export type LocaleCode = "en" | "es"

/** User role as stored in the profiles table. */
export type UserRole =
  | "standard_customer"
  | "student"
  | "professional"
  | "salon_owner"
  | "admin"

/** Professional verification state. */
export type VerificationStatus = "regular" | "pending" | "verified" | "rejected"

// ── Catalog / Product ─────────────────────────────────────────────────────────

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

// ── Cart Totals ───────────────────────────────────────────────────────────────

export interface Totals {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  itemCount: number
}

// ── Checkout ──────────────────────────────────────────────────────────────────

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

// ── Order ─────────────────────────────────────────────────────────────────────

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

/** Minutes the cancellation window stays open. */
export const CANCEL_WINDOW_MINUTES = 120

// ── Profile / Account ─────────────────────────────────────────────────────────

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
