"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { ADMIN_SERVER_CARD_CLASS } from "@/lib/admin/card-styles"
import { cn } from "@/lib/utils"

export interface AdminSurfaceCardProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  title?: string
  description?: string
  icon?: LucideIcon
  headerAction?: ReactNode
}

/** Minimal admin card — static border, no motion or glow. */
export function AdminSurfaceCard({
  children,
  className,
  contentClassName,
  title,
  description,
  icon: IconComponent,
  headerAction,
}: AdminSurfaceCardProps) {
  return (
    <div className={cn(ADMIN_SERVER_CARD_CLASS, className)}>
      <div className={cn("p-5 sm:p-6", contentClassName)}>
        {(title || description || IconComponent || headerAction) && (
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {IconComponent && (
                <div className="bg-muted text-foreground border-border flex size-10 shrink-0 items-center justify-center rounded-xl border">
                  <IconComponent className="size-4.5" strokeWidth={1.75} />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 className="text-foreground text-sm font-semibold tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {headerAction}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
