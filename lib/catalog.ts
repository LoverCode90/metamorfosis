/**
 * Backward-compat barrel — all catalog logic has moved to lib/catalog/index.ts
 * Imports from "@/lib/catalog" still resolve during Phase 2 migration.
 */
export type {
  CatalogProduct,
  ColorVariant,
  ProductType,
  ActiveFilters,
} from "./catalog/mock-data"
export {
  CATALOG,
  CATEGORIES,
  BRANDS,
  CATALOG_IMAGE,
  PRICE_CEILING,
  EMPTY_FILTERS,
} from "./catalog/mock-data"
export {
  getProduct,
  getRelated,
  filterCatalog,
  countByCategory,
  countByBrand,
} from "./catalog/index"
