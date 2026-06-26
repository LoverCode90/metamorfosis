"use client"

import { memo } from "react"
import Link from "next/link"
import { User, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MobileNavProfileHeaderProps {
  name: string
  email: string
  onClick: () => void
}

/** Tappable profile summary at the top of the mobile drawer. */
export function MobileNavProfileHeader({
  name,
  email,
  onClick,
}: MobileNavProfileHeaderProps) {
  return (
    <Link
      href="/profile"
      onClick={onClick}
      className="border-border hover:bg-muted flex w-full items-center gap-3 border-b px-5 py-4 text-left transition-colors"
    >
      <span className="bg-foreground text-background flex h-11 w-11 items-center justify-center rounded-full">
        <User className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-sm font-semibold">
          {name}
        </span>
        <span className="text-muted-foreground block truncate text-xs">
          {email}
        </span>
      </span>
    </Link>
  )
}

interface MobileNavLinkProps {
  href: string
  label: string
  active: boolean
  onClick: () => void
}

/** Browse-section nav link with an active highlight (memoized list item). */
export const MobileNavLink = memo(function MobileNavLink({
  href,
  label,
  active,
  onClick,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block w-full rounded-md px-3 py-3 text-left text-sm transition-colors",
        active
          ? "bg-accent-violet/10 text-accent-violet font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  )
})

interface NavDrawerRowProps {
  href: string
  icon: LucideIcon
  label: string
  badge?: number
  onClick: () => void
}

/** Account-shortcut row with an optional count badge (memoized list item). */
export const NavDrawerRow = memo(function NavDrawerRow({
  href,
  icon: Icon,
  label,
  badge,
  onClick,
}: NavDrawerRowProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition-colors"
    >
      <Icon className="text-muted-foreground h-4 w-4" strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge variant="violet" className="min-w-5">
          {badge}
        </Badge>
      )}
    </Link>
  )
})
