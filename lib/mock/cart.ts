/**
 * TEMPORARY MOCK DATA — replaced in Phase 4/5 with real Square catalog.
 * Do not use for pricing or inventory truth.
 */
import type { CartItem, Product } from "@/lib/types"

export const MOCK_INITIAL_CART: CartItem[] = [
  {
    id: "lab-noir-7n",
    variationId: "mock-var-lab-noir-7n",
    squareVariationId: "mock-sq-lab-noir-7n",
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
    variationId: "mock-var-oxidant-20",
    squareVariationId: "mock-sq-oxidant-20",
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
    variationId: "mock-var-bond-serum",
    squareVariationId: "mock-sq-bond-serum",
    name: "Bond Repair Serum",
    variant: "Step 1 · 100ml",
    image: "/products/bond-repair-serum.png",
    unitPrice: 34,
    discountPerItem: 3,
    stock: 25,
    quantity: 1,
  },
]

export const MOCK_RELATED_PRODUCTS: Product[] = [
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
