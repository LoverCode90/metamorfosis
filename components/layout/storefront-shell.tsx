import type { ReactNode } from "react"

import { SiteHeader } from "@/components/layout/site-header"
import { OAuthHistoryGuard } from "@/components/auth/oauth-history-guard"
import { StorefrontDarkMode } from "@/components/layout/storefront-dark-mode"

interface StorefrontShellProps {
  children: ReactNode
  footer?: ReactNode
}

/** Shared chrome for marketing, shop, account, and checkout routes. */
export function StorefrontShell({ children, footer }: StorefrontShellProps) {
  return (
    <>
      <StorefrontDarkMode />
      <OAuthHistoryGuard />
      <div className="dark bg-background text-foreground flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        {footer}
      </div>
    </>
  )
}
