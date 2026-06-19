/**
 * TEMPORARY MOCK CATALOG — replaced in Phase 4 with real Square inventory.
 * Generated deterministically so server and client render identically.
 */
import type { Product } from "@/lib/types"

export const CATALOG_IMAGE = "/metamorfosis-product.png"

export type ProductType = "standard" | "color"

export interface ColorVariant {
  id: string
  name: string
  hex: string
}

export interface CatalogProduct extends Product {
  type: ProductType
  category: string
  brand: string
  isNew: boolean
  isProfessional: boolean
  description: string
  benefits: string[]
  ingredients: string[]
  colorVariants?: ColorVariant[]
}

export const CATEGORIES = [
  "Permanent Color",
  "Toners",
  "Lighteners",
  "Care",
  "Tools",
  "Developers",
] as const

export const BRANDS = [
  "Metamorfosis",
  "Lab Noir",
  "Studio Pro",
  "Atelier",
  "Essentials",
] as const

export const PRICE_CEILING = 60

export interface ActiveFilters {
  search: string
  categories: string[]
  brands: string[]
  maxPrice: number
}

export const EMPTY_FILTERS: ActiveFilters = {
  search: "",
  categories: [],
  brands: [],
  maxPrice: PRICE_CEILING,
}

// ── Seeded generation helpers ─────────────────────────────────────────────────

function seeded(n: number) {
  const x = Math.sin(n + 1) * 10000
  return x - Math.floor(x)
}

function pick<T>(arr: T[], n: number): T {
  return arr[Math.floor(seeded(n) * arr.length) % arr.length]
}

const TONALITY_POOL: ColorVariant[] = [
  { id: "1-0", name: "1.0 True Black", hex: "#1a1a1a" },
  { id: "3-0", name: "3.0 Dark Brown", hex: "#3b2417" },
  { id: "5-3", name: "5.3 Light Golden Brown", hex: "#6b4a2b" },
  { id: "6-0", name: "6.0 Dark Blonde", hex: "#8a5a32" },
  { id: "7-43", name: "7.43 Copper Gold", hex: "#b06a35" },
  { id: "8-1", name: "8.1 Light Ash Blonde", hex: "#b89a78" },
  { id: "9-0", name: "9.0 Very Light Blonde", hex: "#d8bd97" },
  { id: "10-21", name: "10.21 Platinum Pearl", hex: "#e7dcc8" },
  { id: "0-66", name: "0.66 Red Intensifier", hex: "#8c2f24" },
  { id: "0-22", name: "0.22 Violet Mix", hex: "#5a4368" },
]

const DESCRIPTIONS = [
  "A salon-exclusive formula engineered for predictable, true-to-tone results with exceptional grey coverage and lasting vibrancy.",
  "Developed in-house and batch-tested for consistency, this professional product delivers reliable performance wash after wash.",
  "Built for colorists who demand precision — a balanced, low-odour system that conditions while it performs.",
  "A refined professional staple with a smooth, workable texture and dependable, repeatable outcomes on every application.",
]

const BENEFIT_POOL = [
  "Up to 100% grey coverage",
  "Long-lasting, fade-resistant tone",
  "Conditions during processing",
  "Low-ammonia, refined fragrance",
  "Even, streak-free deposit",
  "Optimised for bond protection",
  "Vegan and cruelty-free",
  "Mix ratio 1:1.5 for control",
]

const INGREDIENT_POOL = [
  "Aqua",
  "Cetearyl Alcohol",
  "Glycerin",
  "Panthenol (Pro-Vitamin B5)",
  "Hydrolyzed Keratin",
  "Argan Oil",
  "Sodium Hyaluronate",
  "Tocopherol (Vitamin E)",
]

const VARIANT_SUFFIX = [
  "100ml",
  "200ml",
  "60ml",
  "1000ml",
  "Pro Kit",
  "Refill",
  "Travel",
  "Salon Size",
]

const PRODUCT_NAMES = [
  "Lab Noir Crème",
  "Pure Reflect Toner",
  "Aurora Lightener",
  "Bond Repair Serum",
  "Color Sealing Mask",
  "Tint Precision Brush",
  "Oxidant Activator",
  "Scalp Barrier Shield",
  "Pigment Booster Drops",
  "Velvet Gloss Glaze",
  "Clarify Pre-Wash",
  "Fibre Reconstruct",
  "Cool Ash Corrector",
  "Warm Gold Enhancer",
  "Demi Shine Refresher",
  "Platinum Clay Bleach",
]

export const CATALOG: CatalogProduct[] = Array.from({ length: 86 }, (_, i) => {
  const isColor = seeded(i * 7) > 0.45
  const baseName = pick(PRODUCT_NAMES, i)
  const category = isColor
    ? pick(["Permanent Color", "Toners"], i * 3)
    : pick(["Lighteners", "Care", "Tools", "Developers"], i * 5)
  const price = 12 + Math.floor(seeded(i * 11) * 48)
  const hasDiscount = seeded(i * 13) > 0.6
  const variantCount = 4 + Math.floor(seeded(i * 17) * 6)
  const variants = isColor
    ? TONALITY_POOL.slice(0, variantCount).map((v) => ({ ...v }))
    : undefined

  return {
    id: `cat-${i + 1}`,
    name: `${baseName} ${String.fromCharCode(65 + (i % 8))}${i + 1}`,
    variant: isColor
      ? `${variantCount} shades available`
      : pick(VARIANT_SUFFIX, i * 2),
    image: CATALOG_IMAGE,
    unitPrice: price,
    discountPerItem: hasDiscount ? Math.max(2, Math.floor(price * 0.15)) : 0,
    stock: 1 + Math.floor(seeded(i * 19) * 60),
    type: isColor ? "color" : "standard",
    category,
    brand: pick([...BRANDS], i * 23),
    isNew: seeded(i * 29) > 0.78,
    isProfessional: seeded(i * 31) > 0.55,
    description: pick(DESCRIPTIONS, i),
    benefits: BENEFIT_POOL.filter((_, b) => seeded(i * 37 + b) > 0.45).slice(
      0,
      5,
    ),
    ingredients: INGREDIENT_POOL.filter(
      (_, g) => seeded(i * 41 + g) > 0.4,
    ).slice(0, 6),
    colorVariants: variants,
  }
})
