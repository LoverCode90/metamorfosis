import type {
  CatalogCard,
  CatalogProduct,
  CatalogVariation,
  ColorFamily,
} from "./types"

/* ── DB row shapes (subset of columns we select) ────────────────────────── */

export interface DbProductRow {
  square_product_id: string
  name_en: string
  description_en: string
  categories_hierarchy: string
  is_professional: boolean
  is_returnable: boolean
  is_color_product: boolean
  color_family: string | null
  color_chart_pdf_url: string | null
  image_url: string | null
  image_urls: string[] | null
  package_class: string | null
  is_active: boolean
  recommended_skus: string[]
}

export interface DbVariationRow {
  id: string
  square_variation_id: string
  square_product_id: string
  sku: string | null
  name_en: string
  price_cents: number
  weight_lb: number | null
  inventory_count: number
  hex_color: string | null
  shade_number: string | null
  size_label: string | null
  image_url: string | null
  is_active: boolean
}

function parseImageUrls(value: string[] | null | undefined): string[] {
  if (!value || !Array.isArray(value)) return []
  return value.filter(
    (url): url is string => typeof url === "string" && url.length > 0,
  )
}

/* ── Mappers ─────────────────────────────────────────────────────────────── */

export function mapVariation(row: DbVariationRow): CatalogVariation {
  return {
    id: row.id,
    squareVariationId: row.square_variation_id,
    squareProductId: row.square_product_id,
    sku: row.sku,
    nameEn: row.name_en,
    priceCents: row.price_cents,
    weightLb: row.weight_lb,
    inventoryCount: row.inventory_count,
    hexColor: row.hex_color,
    shadeNumber: row.shade_number,
    sizeLabel: row.size_label,
    imageUrl: row.image_url,
    isActive: row.is_active,
  }
}

export function mapProduct(
  row: DbProductRow,
  variations: DbVariationRow[],
): CatalogProduct {
  const activeVars = variations.filter((v) => v.is_active).map(mapVariation)
  const prices = activeVars.map((v) => v.priceCents)
  const minPriceCents = prices.length > 0 ? Math.min(...prices) : 0
  const totalStock = activeVars.reduce((s, v) => s + v.inventoryCount, 0)
  const imageUrls = parseImageUrls(row.image_urls)
  const imageUrl = row.image_url ?? imageUrls[0] ?? null

  return {
    squareProductId: row.square_product_id,
    nameEn: row.name_en,
    descriptionEn: row.description_en,
    categoriesHierarchy: row.categories_hierarchy,
    isProfessional: row.is_professional,
    isReturnable: row.is_returnable,
    isColorProduct: row.is_color_product,
    colorFamily: row.color_family as ColorFamily | null,
    colorChartPdfUrl: row.color_chart_pdf_url,
    imageUrl,
    imageUrls: imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [],
    packageClass: row.package_class,
    isActive: row.is_active,
    minPriceCents,
    totalStock,
    variations: activeVars,
    recommendedSkus: row.recommended_skus ?? [],
  }
}

export function mapCard(
  row: DbProductRow & {
    min_price_cents?: number
    total_stock?: number
    variation_count?: number
    default_variation_id?: string | null
    default_square_variation_id?: string | null
  },
): CatalogCard {
  return {
    squareProductId: row.square_product_id,
    nameEn: row.name_en,
    categoriesHierarchy: row.categories_hierarchy,
    isProfessional: row.is_professional,
    isReturnable: row.is_returnable,
    isColorProduct: row.is_color_product,
    imageUrl: row.image_url,
    imageUrls: parseImageUrls(row.image_urls),
    minPriceCents: row.min_price_cents ?? 0,
    totalStock: row.total_stock ?? 0,
    variationCount: row.variation_count ?? 1,
    defaultVariationId: row.default_variation_id ?? null,
    defaultSquareVariationId: row.default_square_variation_id ?? null,
  }
}
