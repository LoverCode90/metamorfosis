/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { squareImageUrl } from "@/lib/utils/square-image"
import { cn } from "@/lib/utils"

interface ProductCardMediaProps {
  images: string[]
  href: string
  alt: string
  isPro: boolean
  lowStock: boolean
  outOfStock: boolean
}

const ARROW_CLASS =
  "bg-background/80 absolute top-1/2 z-10 -translate-y-1/2 rounded-full opacity-0 shadow-sm backdrop-blur transition-opacity group-hover/img:opacity-100"

/** Square product image with status badges and a hover carousel. */
export function ProductCardMedia({
  images,
  href,
  alt,
  isPro,
  lowStock,
  outOfStock,
}: ProductCardMediaProps) {
  const [imgIdx, setImgIdx] = useState(0)
  const hasMultiple = images.length > 1
  const imgSrc = squareImageUrl(images[imgIdx], 600) ?? "/placeholder.svg"

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
        <Badge
          variant="warning"
          className="pointer-events-none absolute top-2.5 left-2.5 z-10"
        >
          Pro
        </Badge>
      )}
      {lowStock && !outOfStock && (
        <Badge className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 border-transparent bg-amber-500/90 text-white">
          Low stock
        </Badge>
      )}

      {hasMultiple && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.preventDefault()
              setImgIdx((i) => (i > 0 ? i - 1 : images.length - 1))
            }}
            aria-label="Previous image"
            className={cn(ARROW_CLASS, "left-1.5")}
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.preventDefault()
              setImgIdx((i) => (i + 1) % images.length)
            }}
            aria-label="Next image"
            className={cn(ARROW_CLASS, "right-1.5")}
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover/img:opacity-100">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 w-1 rounded-full transition-colors",
                  i === imgIdx ? "bg-white" : "bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
