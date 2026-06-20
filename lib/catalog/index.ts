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
    if (f.categories.length > 0) {
      const hier = p.categoriesHierarchy.toLowerCase()
      const matches = f.categories.some((cat) => {
        const catL = cat.toLowerCase()
        // 1. Exact prefix match (e.g. DB stores "Hair Care > Shampoos…")
        if (hier.startsWith(catL)) return true
        // 2. Substring match — handles deeper nesting or reordered paths
        if (hier.includes(catL)) return true
        // 3. Leaf-word match — fallback when Square names differ slightly
        //    e.g. filter "Hair Care > Shampoos" → leaf "shampoos"
        const leaf = catL.split(" > ").pop()?.trim() ?? catL
        return (
          leaf.length >= 3 &&
          hier.split(" > ").some((seg) => seg.trim().includes(leaf))
        )
      })
      if (!matches) return false
    }
    if (Number.isFinite(f.maxPrice) && p.minPriceCents > f.maxPrice)
      return false
    return true
  })
}
