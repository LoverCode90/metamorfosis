import type { ReactNode } from "react"
import { SiteHeader } from "@/components/layout/site-header"

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
