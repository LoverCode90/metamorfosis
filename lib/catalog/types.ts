export type ColorFamily = "naturals" | "warm" | "cool" | "pastel" | "special"

export interface CatalogVariation {
  id: string
  squareVariationId: string
  squareProductId: string
  sku: string | null
  nameEn: string
  priceCents: number
  weightLb: number | null
  inventoryCount: number
  hexColor: string | null
  shadeNumber: string | null
  sizeLabel: string | null
  imageUrl: string | null
  isActive: boolean
}

export interface CatalogProduct {
  squareProductId: string
  nameEn: string
  descriptionEn: string
  categoriesHierarchy: string
  isProfessional: boolean
  isReturnable: boolean
  isColorProduct: boolean
  colorFamily: ColorFamily | null
  colorChartPdfUrl: string | null
  imageUrl: string | null
  imageUrls: string[]
  isActive: boolean
  /** Min price in cents across all active variations */
  minPriceCents: number
  /** Total inventory across all active variations */
  totalStock: number
  variations: CatalogVariation[]
  recommendedSkus: string[]
}

/** Subset used in catalog grid cards — no full variations list */
export interface CatalogCard {
  squareProductId: string
  nameEn: string
  categoriesHierarchy: string
  isProfessional: boolean
  isColorProduct: boolean
  imageUrl: string | null
  /** Min price in cents (cheapest active variation) */
  minPriceCents: number
  totalStock: number
  /** product_variations.id of the cheapest active variation */
  defaultVariationId: string | null
  /** Square ITEM_VARIATION ID for the cheapest active variation */
  defaultSquareVariationId: string | null
}

export interface ActiveFilters {
  search: string
  categories: string[]
  /** Maximum price filter in cents */
  maxPrice: number
}

export const EMPTY_FILTERS: ActiveFilters = {
  search: "",
  categories: [],
  maxPrice: Infinity,
}

export const LOW_STOCK_THRESHOLD = parseInt(
  process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD ?? "4",
  10,
)
