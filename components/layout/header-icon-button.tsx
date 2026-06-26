"use client"

import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface HeaderIconButtonProps {
  label: string
  children: ReactNode
  badge?: number
  loading?: boolean
  onClick?: () => void
  active?: boolean
  className?: string
}

/** Header icon button with an optional count badge and a loading placeholder. */
export function HeaderIconButton({
  label,
  children,
  badge,
  loading,
  onClick,
  active,
  className,
}: HeaderIconButtonProps) {
  const buttonClass = cn("relative h-9 w-9", active && "bg-muted", className)
  const badgeClass = "absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px]"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label={label}
      className={buttonClass}
    >
      {children}
      {loading ? (
        <Skeleton
          className={cn(badgeClass, "border-border rounded-full border")}
        />
      ) : badge !== undefined && badge > 0 ? (
        <Badge variant="default" className={badgeClass}>
          {badge}
        </Badge>
      ) : null}
    </Button>
  )
}
