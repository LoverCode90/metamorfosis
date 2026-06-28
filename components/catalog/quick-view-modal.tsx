/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, ShoppingBag } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductVariantSelector } from "./product-variant-selector"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { formatUSD } from "@/lib/utils/format"
import { squareImageUrl } from "@/lib/utils/square-image"
import type { CatalogCard, CatalogProduct } from "@/lib/catalog"

interface QuickViewModalProps {
  open: boolean
  onClose: () => void
  card: CatalogCard
}

export function QuickViewModal({ open, onClose, card }: QuickViewModalProps) {
  const { addToCart } = useCart()
  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [selectedId, setSelectedId] = useState("")
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch(`/api/catalog/${card.squareProductId}`)
      .then((r) => r.json())
      .then((data: CatalogProduct) => {
        setProduct(data)
        setSelectedId(data.variations[0]?.id ?? "")
      })
      .catch(() => {})
  }, [open, card.squareProductId])

  const selected = product?.variations.find((v) => v.id === selectedId)
  const price = selected?.priceCents ?? card.minPriceCents
  const href = `/products/${card.squareProductId}`
  const imgUrl = squareImageUrl(card.imageUrl ?? "", 400) ?? "/placeholder.svg"

  function handleAdd() {
    if (!selected || !product) return
    const variantLabel = product.isColorProduct
      ? (selected.shadeNumber ?? selected.nameEn)
      : (selected.sizeLabel ?? selected.nameEn)
    addToCart({
      id: product.squareProductId,
      name: product.nameEn,
      variant: variantLabel,
      image: product.imageUrl ?? "",
      unitPrice: price,
      discountPerItem: 0,
      stock: selected.inventoryCount,
      isProfessional: product.isProfessional,
      isColorProduct: product.isColorProduct,
      isReturnable: product.isReturnable,
      variationId: selected.id,
      squareVariationId: selected.squareVariationId,
    })
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      onClose()
    }, 900)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base leading-snug">
            {card.nameEn}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 pt-1">
          <img
            src={imgUrl}
            alt={card.nameEn}
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
          />
          <p className="text-foreground text-xl font-bold tabular-nums">
            {formatUSD(price)}
          </p>
        </div>

        {!product ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            Loading…
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {product.variations.length > 1 && (
              <ProductVariantSelector
                variations={product.variations}
                selectedId={selectedId}
                onSelect={setSelectedId}
                isColorProduct={product.isColorProduct}
              />
            )}
            <Button
              onClick={handleAdd}
              disabled={!selectedId || added}
              className="w-full"
            >
              {added ? (
                <Check className="h-4 w-4" strokeWidth={2.5} />
              ) : (
                <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
              )}
              {added ? "Added!" : "Add to Bag"}
            </Button>
            <Link
              href={href}
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground block text-center text-sm"
            >
              View full details →
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
