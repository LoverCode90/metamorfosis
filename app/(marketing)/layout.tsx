import type { ReactNode } from "react"

import { StorefrontShell } from "@/components/layout/storefront-shell"

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <StorefrontShell>{children}</StorefrontShell>
}
