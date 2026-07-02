/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils"
import {
  resolveProductImageUrl,
  type ProductImageSource,
} from "@/lib/admin/product-image"

const SIZE_CLASS = {
  sm: "size-10",
  md: "size-12",
} as const

interface AdminProductThumbProps {
  variation?: ProductImageSource | null
  alt: string
  size?: keyof typeof SIZE_CLASS
  className?: string
}

/** Small product thumbnail for admin lists and order detail. */
export function AdminProductThumb({
  variation,
  alt,
  size = "sm",
  className,
}: AdminProductThumbProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted shrink-0 overflow-hidden rounded-md border",
        SIZE_CLASS[size],
        className,
      )}
    >
      <img
        src={resolveProductImageUrl(variation)}
        alt={alt}
        className="h-full w-full object-cover"
      />
    </div>
  )
}
