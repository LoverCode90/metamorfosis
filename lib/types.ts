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
  /** squareProductId — used for catalog page links */
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
  /** product_variations.id UUID — required for checkout; optional on legacy paths */
  variationId?: string
  /** Square ITEM_VARIATION ID — optional on legacy paths */
  squareVariationId?: string
  /** Whether this item is a color product — drives the $2 professional discount */
  isColorProduct?: boolean
}

export interface CartItem extends Product {
  quantity: number
  /**
   * product_variations.id (our UUID) — required for checkout and DB cart_items.
   * Guests: stored in localStorage. Auth users: FK into cart_items.variation_id.
   */
  variationId: string
  /** Square ITEM_VARIATION ID — passed to Square Payments API. */
  squareVariationId: string
  /** Whether this item is a color product — drives the $2 professional discount. */
  isColorProduct?: boolean
  /** Set to true when the variation is no longer is_active — blocks checkout. */
  unavailable?: boolean
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

// ── Database row shapes (Supabase) ──────────────────────────────────────────────

/** Verification state as stored in the DB `pro_verification_status` enum. */
export type DbVerificationStatus =
  | "not_applicable"
  | "pending_review"
  | "approved"
  | "rejected"

/**
 * Subset of the `public.profiles` row that the storefront reads.
 * Mirrors docs/00_Schema.sql section 3.1.
 */
export interface DbProfile {
  id: string
  email: string
  full_name: string
  phone_number: string | null
  bio: string | null
  role: UserRole
  verification_status: DbVerificationStatus
  license_number: string | null
  business_name: string | null
  school_name: string | null
  graduation_date: string | null
  document_url: string | null
  expiration_date: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}
