import type { ReactNode } from "react"

import { NewMessageNotifier } from "@/components/account/new-message-notifier"
import { StorefrontShell } from "@/components/layout/storefront-shell"

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <StorefrontShell footer={<NewMessageNotifier />}>
      {children}
    </StorefrontShell>
  )
}
