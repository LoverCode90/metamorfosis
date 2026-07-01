import Image from "next/image"

import { cn } from "@/lib/utils"

interface BentoImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
}

/** Rounded image tile used in the about-page hero bento grid. */
export function BentoImage({
  src,
  alt,
  className,
  sizes = "(max-width: 1024px) 50vw, 25vw",
}: BentoImageProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted relative min-h-[180px] overflow-hidden rounded-xl border sm:min-h-[220px]",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover grayscale"
      />
    </div>
  )
}
