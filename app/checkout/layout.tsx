import type { ReactNode } from "react"
import { SiteHeader } from "@/components/layout/site-header"

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark">
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
