import { cn } from "@/lib/utils"

/**
 * Animated placeholder block for loading states.
 * Style its dimensions via `className` (e.g. `h-12 w-full`).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
