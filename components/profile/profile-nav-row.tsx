import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"

interface ProfileNavRowProps {
  href: string
  icon: LucideIcon
  title: string
  description: string
}

/**
 * Tappable account row: icon + title + description + chevron, links to a
 * dedicated profile subpage. Mirrors the mobile-app settings pattern.
 */
export function ProfileNavRow({
  href,
  icon: Icon,
  title,
  description,
}: ProfileNavRowProps) {
  return (
    <Link
      href={href}
      className="border-border bg-card hover:bg-muted/50 focus-visible:ring-ring group flex items-center gap-4 rounded-2xl border p-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <span className="bg-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        <Icon className="text-foreground h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-foreground block text-sm font-semibold">
          {title}
        </span>
        <span className="text-muted-foreground block truncate text-xs">
          {description}
        </span>
      </span>
      <ChevronRight
        className="text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 transition-colors"
        strokeWidth={1.75}
      />
    </Link>
  )
}
