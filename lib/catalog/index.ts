/**
 * Catalog public API — re-exports types and pure client-safe helpers.
 * Server-only queries live in lib/catalog/queries.ts.
 */

export type {
  CatalogCard,
  CatalogProduct,
  CatalogVariation,
  ActiveFilters,
  ColorFamily,
} from "./types"
export { EMPTY_FILTERS, LOW_STOCK_THRESHOLD } from "./types"

import type { ActiveFilters, CatalogCard } from "./types"

export function filterCatalogCards(
  cards: CatalogCard[],
  f: ActiveFilters,
): CatalogCard[] {
  const q = f.search.trim().toLowerCase()
  return cards.filter((p) => {
    if (q && !p.nameEn.toLowerCase().includes(q)) return false
    if (
      f.categories.length > 0 &&
      !f.categories.some((cat) =>
        p.categoriesHierarchy.toLowerCase().startsWith(cat.toLowerCase()),
      )
    )
      return false
    if (Number.isFinite(f.maxPrice) && p.minPriceCents > f.maxPrice)
      return false
    return true
  })
}
