"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  image: string
  name: string
  /** Optional badge text shown over the main image (e.g. "PROFESSIONAL"). */
  badge?: string
}

export function ProductGallery({ image, name, badge }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  // The catalog reuses a single image; we present it across framed thumbnails
  // to communicate multiple angles without extra network requests.
  const thumbs = [0, 1, 2, 3]

  const objectClass = ["object-cover", "object-contain p-8", "object-cover", "object-contain p-12"]

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className={cn("h-full w-full", objectClass[active])}
        />
        {badge && (
          <span className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background">
            {badge}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {thumbs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActive(t)}
            aria-label={`View ${name} image ${t + 1}`}
            className={cn(
              "aspect-square overflow-hidden rounded-xl border bg-muted transition-colors",
              active === t
                ? "border-foreground"
                : "border-border hover:border-foreground/40",
            )}
          >
            <img
              src={image || "/placeholder.svg"}
              alt=""
              aria-hidden="true"
              className={cn("h-full w-full", objectClass[t])}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
