import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface AdminPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

/** Consistent page title block for admin views. */
export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  )
}

interface AdminBentoGridProps {
  children: ReactNode
  className?: string
}

/** Responsive bento-style grid for admin settings and dashboards. */
export function AdminBentoGrid({ children, className }: AdminBentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  )
}
