import { type NextRequest, NextResponse } from "next/server"
import { fetchProductDetail } from "@/lib/catalog/queries"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const product = await fetchProductDetail(id)
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(product)
}
