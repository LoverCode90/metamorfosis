/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { squareImageUrl } from "@/lib/utils/square-image"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  imageUrls: string[]
  name: string
  badge?: string
}

export function ProductGallery({
  imageUrls,
  name,
  badge,
}: ProductGalleryProps) {
  const images = imageUrls.length > 0 ? imageUrls : ["/placeholder.svg"]
  const [activeIdx, setActiveIdx] = useState(0)
  const safeIdx = activeIdx < images.length ? activeIdx : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="border-border bg-muted relative aspect-square overflow-hidden rounded-2xl border">
        <img
          src={
            squareImageUrl(images[safeIdx] ?? null, 1200) ?? "/placeholder.svg"
          }
          alt={name}
          loading="eager"
          className="h-full w-full object-cover transition-opacity duration-200"
        />
        {badge && (
          <span className="bg-foreground text-background absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            {badge}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`Ver imagen ${i + 1} de ${images.length}`}
              aria-pressed={i === safeIdx}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150",
                i === safeIdx
                  ? "border-accent-violet opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90",
              )}
            >
              <img
                src={squareImageUrl(url, 160) ?? "/placeholder.svg"}
                alt={`${name} vista ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
