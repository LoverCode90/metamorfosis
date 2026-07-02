import { squareImageUrl } from "@/lib/utils/square-image"

export interface ProductImageSource {
  image_url?: string | null
  product_translations?: { image_url?: string | null } | null
}

/** Variation image first, then parent product image, then placeholder. */
export function resolveProductImageUrl(
  variation: ProductImageSource | null | undefined,
  width = 96,
): string {
  const raw =
    variation?.image_url ?? variation?.product_translations?.image_url ?? null
  return squareImageUrl(raw, width) ?? "/placeholder.svg"
}
