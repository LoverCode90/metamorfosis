"use client"

import { useEffect, useRef, type ReactNode } from "react"

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

export function HeaderIconButton({
  label,
  children,
  badge,
  loading,
  onClick,
  active,
  className,
}: HeaderIconButtonProps) {
  const badgeRef = useRef<HTMLSpanElement>(null)
  const prevCount = useRef(badge ?? 0)

  useEffect(() => {
    const count = badge ?? 0
    if (count > prevCount.current && badgeRef.current) {
      badgeRef.current.classList.remove("animate-badge-pop")
      void badgeRef.current.offsetWidth
      badgeRef.current.classList.add("animate-badge-pop")
    }
    prevCount.current = count
  }, [badge])

  const buttonClass = cn("relative h-9 w-9", active && "bg-muted", className)
  const badgeClass =
    "absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black shadow-sm"

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
        <Skeleton className={cn(badgeClass, "border-border border")} />
      ) : badge !== undefined && badge > 0 ? (
        <span ref={badgeRef} className={badgeClass}>
          {badge}
        </span>
      ) : null}
    </Button>
  )
}
