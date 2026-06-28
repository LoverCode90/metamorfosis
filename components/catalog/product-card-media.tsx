/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { squareImageUrl } from "@/lib/utils/square-image"

interface ProductCardMediaProps {
  images: string[]
  href: string
  alt: string
  isPro: boolean
  lowStock: boolean
  outOfStock: boolean
}

/** Square product image with status badges. */
export function ProductCardMedia({
  images,
  href,
  alt,
  isPro,
  lowStock,
  outOfStock,
}: ProductCardMediaProps) {
  const imgSrc = squareImageUrl(images[0], 600) ?? "/placeholder.svg"

  return (
    <div className="border-border bg-muted group/img relative aspect-square w-full overflow-hidden rounded-lg border">
      <Link
        href={href}
        className="focus-visible:ring-ring absolute inset-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={`View ${alt}`}
      >
        <img
          src={imgSrc}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {isPro && (
        <Badge className="bg-accent-violet pointer-events-none absolute top-2.5 left-2.5 z-10 text-white">
          Pro
        </Badge>
      )}
      {lowStock && !outOfStock && (
        <Badge
          variant="warning"
          className="pointer-events-none absolute bottom-2.5 left-2.5 z-10"
        >
          Low stock
        </Badge>
      )}
    </div>
  )
}
