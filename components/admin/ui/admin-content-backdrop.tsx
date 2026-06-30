"use client"

import type { ReactNode } from "react"

import { DotPattern } from "@/components/ui/dot-pattern"
import { cn } from "@/lib/utils"

interface AdminContentBackdropProps {
  children: ReactNode
  className?: string
}

/** Subtle Magic UI dot pattern behind admin main content. */
export function AdminContentBackdrop({
  children,
  className,
}: AdminContentBackdropProps) {
  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <DotPattern
        width={18}
        height={18}
        cr={0.8}
        glow
        className="text-primary/25 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)] opacity-30"
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  )
}
