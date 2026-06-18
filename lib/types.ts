/**
 * Shared primitive types used across the application.
 * Richer domain types (Product, CartItem, Order, etc.) are added
 * in Phase 2–3 when the Supabase schema is fully integrated.
 */

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
