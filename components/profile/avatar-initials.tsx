import { initialsFromName } from "@/lib/auth/mappers"
import { cn } from "@/lib/utils"

/**
 * Circular avatar showing the user's initials. Background uses bg-accent-violet
 * to match the "Add to Bag" CTA color on the product detail page.
 */
export function AvatarInitials({
  firstName,
  lastName,
  size = 80,
  className,
}: {
  firstName: string
  lastName: string
  size?: number
  className?: string
}) {
  const initials = initialsFromName(firstName, lastName)
  const fontSize = Math.round(size * 0.4)
  return (
    <span
      aria-label={`${firstName} ${lastName}`.trim() || "User avatar"}
      style={{ width: size, height: size, fontSize }}
      className={cn(
        "bg-accent-violet flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide text-white select-none",
        className,
      )}
    >
      {initials}
    </span>
  )
}
