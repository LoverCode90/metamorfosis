import Image from "next/image"

import { cn } from "@/lib/utils"

interface BentoImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
}

/** Square image tile for the about-page photo row. */
export function BentoImage({
  src,
  alt,
  className,
  sizes = "50vw",
}: BentoImageProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted relative aspect-square w-full overflow-hidden rounded-xl border",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover object-top grayscale"
      />
    </div>
  )
}
