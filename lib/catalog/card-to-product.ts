import type { CatalogCard } from "@/lib/catalog"
import type { Product } from "@/lib/types"

/** Maps a catalog card to the {@link Product} shape used by the cart/wishlist. */
export function cardToProduct(card: CatalogCard): Product {
  return {
    id: card.squareProductId,
    name: card.nameEn,
    variant: "",
    image: card.imageUrl ?? "",
    unitPrice: card.minPriceCents,
    discountPerItem: 0,
    stock: card.totalStock,
    isProfessional: card.isProfessional,
    isColorProduct: card.isColorProduct,
    isReturnable: card.isReturnable,
    variationId: card.defaultVariationId ?? undefined,
    squareVariationId: card.defaultSquareVariationId ?? undefined,
  }
}
