export type {
  CatalogProduct,
  ColorVariant,
  ProductType,
  ActiveFilters,
} from "./mock-data"
export {
  CATALOG,
  CATEGORIES,
  BRANDS,
  CATALOG_IMAGE,
  PRICE_CEILING,
  EMPTY_FILTERS,
} from "./mock-data"

import type { ActiveFilters, CatalogProduct } from "./mock-data"
import { CATALOG } from "./mock-data"

export function getProduct(id: string): CatalogProduct | undefined {
  return CATALOG.find((p) => p.id === id)
}

export function getRelated(id: string, count = 4): CatalogProduct[] {
  const current = getProduct(id)
  return CATALOG.filter(
    (p) => p.id !== id && (!current || p.category === current.category),
  ).slice(0, count)
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
