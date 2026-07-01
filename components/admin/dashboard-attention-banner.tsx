import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardAttentionBannerProps {
  pendingStorePickups: number
  pendingShipments: number
  pendingVerifications: number
  openCases: number
}

interface AttentionItem {
  count: number
  message: string
  href: string
  buttonLabel: string
}

/** Highlights what needs action today with large, obvious buttons. */
export function DashboardAttentionBanner({
  pendingStorePickups,
  pendingShipments,
  pendingVerifications,
  openCases,
}: DashboardAttentionBannerProps) {
  const items: AttentionItem[] = [
    {
      count: pendingStorePickups,
      message: "customer(s) waiting to pick up in the store",
      href: "/admin/store-pickups?tab=pending",
      buttonLabel: "Open customer pickups",
    },
    {
      count: pendingShipments,
      message: "package(s) need a shipping label",
      href: "/admin/orders?status=pending",
      buttonLabel: "Print shipping labels",
    },
    {
      count: pendingVerifications,
      message: "license(s) waiting for your review",
      href: "/admin/verifications",
      buttonLabel: "Review licenses",
    },
    {
      count: openCases,
      message: "support case(s) need your attention",
      href: "/admin/cases?status=open",
      buttonLabel: "Open cases",
    },
  ].filter((item) => item.count > 0)

  if (items.length === 0) {
    return (
      <section className="border-border bg-card rounded-2xl border p-5 md:p-6">
        <p className="text-foreground text-base font-medium">
          You are all caught up — nothing needs your attention right now.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 md:p-6">
      <h2 className="text-foreground text-lg font-semibold">
        Needs your attention
      </h2>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.href}
            className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-foreground text-base leading-relaxed">
              <strong className="text-xl tabular-nums">{item.count}</strong>{" "}
              {item.message}
            </p>
            <Link
              href={item.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-auto min-h-11 shrink-0 py-3",
              )}
            >
              {item.buttonLabel}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
