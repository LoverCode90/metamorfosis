// ---------------------------------------------------------------------------
// Catalog domain for the Metamorfosis storefront.
//
// Performance note: per the product brief, EVERY product card reuses a single
// fixed Unsplash image. This keeps the listing page light (one cached request)
// instead of fetching dozens of distinct assets.
// ---------------------------------------------------------------------------

import type { Product } from "./checkout"

/** The single shared product image used across the entire catalog. */
export const CATALOG_IMAGE = "/metamorfosis-product.png"

export type ProductType = "standard" | "color"

export interface ColorVariant {
  id: string
  /** Display name shown beneath the preview, e.g. "7.43 Copper Gold". */
  name: string
  /** Swatch fill rendered as the tonality circle. */
  hex: string
}

export interface CatalogProduct extends Product {
  type: ProductType
  category: string
  brand: string
  isNew: boolean
  isProfessional: boolean
  /** Long-form copy for the Description tab / color intro. */
  description: string
  /** Standard products: bullet benefits + ingredient list. */
  benefits: string[]
  ingredients: string[]
  /** Color products: tonality circles + chart PDF. */
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

// A compact tonality palette reused to build color products.
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

// Deterministic pseudo-random so server and client render identically.
function seeded(n: number) {
  const x = Math.sin(n + 1) * 10000
  return x - Math.floor(x)
}

function pick<T>(arr: T[], n: number): T {
  return arr[Math.floor(seeded(n) * arr.length) % arr.length]
}

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

/** The full catalog — 86 products to match the listing's result count. */
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
    benefits: BENEFIT_POOL.filter((_, b) => seeded(i * 37 + b) > 0.45).slice(0, 5),
    ingredients: INGREDIENT_POOL.filter((_, g) => seeded(i * 41 + g) > 0.4).slice(0, 6),
    colorVariants: variants,
  }
})

export function getProduct(id: string): CatalogProduct | undefined {
  return CATALOG.find((p) => p.id === id)
}

export function getRelated(id: string, count = 4): CatalogProduct[] {
  const current = getProduct(id)
  return CATALOG.filter(
    (p) => p.id !== id && (!current || p.category === current.category),
  ).slice(0, count)
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

export interface ActiveFilters {
  search: string
  categories: string[]
  brands: string[]
  maxPrice: number
}

export const PRICE_CEILING = 60

export const EMPTY_FILTERS: ActiveFilters = {
  search: "",
  categories: [],
  brands: [],
  maxPrice: PRICE_CEILING,
}

export function filterCatalog(
  products: CatalogProduct[],
  f: ActiveFilters,
): CatalogProduct[] {
  const q = f.search.trim().toLowerCase()
  return products.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q)) return false
    if (f.categories.length && !f.categories.includes(p.category)) return false
    if (f.brands.length && !f.brands.includes(p.brand)) return false
    if (p.unitPrice > f.maxPrice) return false
    return true
  })
}

export function countByCategory(category: string): number {
  return CATALOG.filter((p) => p.category === category).length
}

export function countByBrand(brand: string): number {
  return CATALOG.filter((p) => p.brand === brand).length
}
