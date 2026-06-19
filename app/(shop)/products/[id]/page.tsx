import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { fetchProductDetail, fetchRelatedProducts } from "@/lib/catalog/queries"
import { ProductDetailPage } from "@/components/catalog/product-detail-page"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await fetchProductDetail(id)
  if (!product) return { title: "Product not found — Metamorfosis Beauty" }
  return {
    title: `${product.nameEn} — Metamorfosis Beauty`,
    description: product.descriptionEn.slice(0, 160),
  }
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params
  const product = await fetchProductDetail(id)
  if (!product) notFound()

  const related = await fetchRelatedProducts(
    product.recommendedSkus,
    product.categoriesHierarchy,
    product.squareProductId,
  )

  return <ProductDetailPage product={product} related={related} />
}
