import { ProductDetailPage } from "@/components/catalog/product-detail-page"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params
  return <ProductDetailPage id={id} />
}
