"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2 } from "lucide-react"

interface ProfileSubpageShellProps {
  title: string
  description?: string
  /** When true, renders a centered spinner instead of children. */
  isLoading?: boolean
  children: ReactNode
}

/**
 * Shared chrome for every /profile/* subpage: a "Back" link to the hub, a
 * heading, and a constrained content column. Shows a spinner while the
 * client-side profile data is still loading.
 */
export function ProfileSubpageShell({
  title,
  description,
  isLoading = false,
  children,
}: ProfileSubpageShellProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/profile"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        Back
      </Link>

      <div className="mt-4 flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="text-muted-foreground flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
