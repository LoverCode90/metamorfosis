/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils"

interface BentoImageProps {
  src: string
  alt: string
  className?: string
}

/** Rounded, grayscale image tile used in the about-page hero bento grid. */
export function BentoImage({ src, alt, className }: BentoImageProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted overflow-hidden rounded-xl border",
        className,
      )}
    >
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="h-full w-full object-cover grayscale"
      />
    </div>
  )
}
