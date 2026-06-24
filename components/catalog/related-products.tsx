import type { CatalogCard } from "@/lib/catalog"
import { ProductCard } from "./product-card"

export function RelatedProducts({ related }: { related: CatalogCard[] }) {
  if (related.length === 0) return null

  return (
    <section className="mt-20">
      <h2 className="text-foreground text-lg font-semibold tracking-tight">
        You may also like
      </h2>
      <div className="mt-6 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4 lg:gap-x-6 [&::-webkit-scrollbar]:hidden">
        {related.map((card) => (
          <div
            key={card.squareProductId}
            className="w-[70%] shrink-0 snap-start sm:w-auto"
          >
            <ProductCard product={card} />
          </div>
        ))}
      </div>
    </section>
  )
}
