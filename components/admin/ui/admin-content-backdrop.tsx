"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface AdminContentBackdropProps {
  children: ReactNode
  className?: string
}

/** Plain admin main content wrapper — no animated background. */
export function AdminContentBackdrop({
  children,
  className,
}: AdminContentBackdropProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {children}
    </div>
  )
}
