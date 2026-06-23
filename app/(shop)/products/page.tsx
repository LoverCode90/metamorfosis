import type { Metadata } from "next"
import { fetchCatalogCards } from "@/lib/catalog/queries"
import { ProductsPage } from "@/components/catalog/products-page"

export const metadata: Metadata = {
  title: "Products — Metamorfosis Beauty",
  description:
    "Browse our full professional catalog of hair color, care, and tools.",
}

import { Suspense } from "react"

export default async function Products() {
  const products = await fetchCatalogCards()

  return (
    <Suspense>
      <ProductsPage products={products} />
    </Suspense>
  )
}
