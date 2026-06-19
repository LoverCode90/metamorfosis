import type { Metadata } from "next"
import { fetchCatalogCards, getFilterFacets } from "@/lib/catalog/queries"
import { ProductsPage } from "@/components/catalog/products-page"

export const metadata: Metadata = {
  title: "Products — Metamorfosis Beauty",
  description:
    "Browse our full professional catalog of hair color, care, and tools.",
}

export default async function Products() {
  const [products, facets] = await Promise.all([
    fetchCatalogCards(),
    getFilterFacets(),
  ])

  return (
    <ProductsPage
      products={products}
      categoryGroups={facets.categoryGroups}
      maxPrice={facets.maxPrice}
    />
  )
}
