/**
 * Backward-compat barrel — all domain types and helpers have moved to:
 *   lib/types.ts          (Product, CartItem, Order, Totals, CheckoutStep…)
 *   lib/utils/totals.ts   (computeTotals, computeTotalsWithShipping, shippingFor)
 *   lib/utils/order.ts    (createOrder)
 *   lib/mock/cart.ts      (MOCK_INITIAL_CART, MOCK_RELATED_PRODUCTS)
 *
 * Imports from "@/lib/checkout" still resolve so existing v0 components
 * compile while they are migrated to the new paths (Phase 2).
 */
export type {
  Product,
  CartItem,
  Totals,
  Order,
  CheckoutStep,
  CheckoutStepId,
  VerificationStatus,
  SavedAddress,
  UserProfile,
} from "./types"
export { CHECKOUT_STEPS, CANCEL_WINDOW_MINUTES } from "./types"

export {
  TAX_RATE,
  SHIPPING_TABLE,
  shippingFor,
  computeTotals,
  computeTotalsWithShipping,
} from "./utils/totals"

export { createOrder } from "./utils/order"

export {
  MOCK_INITIAL_CART as INITIAL_CART,
  MOCK_RELATED_PRODUCTS as RELATED_PRODUCTS,
} from "./mock/cart"

export { formatUSD } from "./utils/format"
