import type { ReactNode } from "react"
import { SiteHeader } from "@/components/layout/site-header"

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
    </>
  )
}
