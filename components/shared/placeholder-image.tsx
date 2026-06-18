import { cn } from "@/lib/utils/cn"

interface PlaceholderImageProps {
  className?: string
  /** Override the aria label for screen readers. */
  label?: string
}

/**
 * Brand-mark fallback for products that have no image in Square.
 * Renders a centered "M" SVG on bg-bg-inset per §11.6.
 * Never fetches an external placeholder URL.
 */
export function PlaceholderImage({
  className,
  label = "No product image",
}: PlaceholderImageProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "bg-bg-inset text-fg-tertiary flex items-center justify-center",
        className,
      )}
    >
      <svg
        viewBox="0 0 40 40"
        className="h-8 w-8 opacity-30"
        aria-hidden="true"
        fill="currentColor"
      >
        <text
          x="50%"
          y="54%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="system-ui, sans-serif"
          fontSize="22"
          fontWeight="600"
        >
          M
        </text>
      </svg>
    </div>
  )
}
