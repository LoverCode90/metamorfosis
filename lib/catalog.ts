/**
 * Barrel re-export — points to the real catalog module (Phase 4+).
 */
export type {
  CatalogCard,
  CatalogProduct,
  CatalogVariation,
  ActiveFilters,
  ColorFamily,
} from "./catalog/index"
export {
  EMPTY_FILTERS,
  LOW_STOCK_THRESHOLD,
  filterCatalogCards,
} from "./catalog/index"
