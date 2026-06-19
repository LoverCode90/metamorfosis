"use client"

import { useState } from "react"
import type { CatalogProduct } from "@/lib/catalog"
import { cn } from "@/lib/utils"

interface ProductTabsProps {
  product: CatalogProduct
}

export function ProductTabs({ product }: ProductTabsProps) {
  const tabs = product.isColorProduct
    ? (["description", "details"] as const)
    : (["description", "details"] as const)
  const [active, setActive] = useState<(typeof tabs)[number]>("description")

  const labels: Record<string, string> = {
    description: "Description",
    details: "Details",
  }

  return (
    <section className="border-border mt-12 border-t pt-8">
      <div className="border-border flex gap-6 border-b" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={cn(
              "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
              active === tab
                ? "border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {labels[tab]}
          </button>
        ))}
      </div>

      <div className="text-muted-foreground pt-6 text-sm leading-relaxed">
        {active === "description" && (
          <div className="max-w-3xl">
            <p>{product.descriptionEn || "No description available."}</p>
          </div>
        )}

        {active === "details" && (
          <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-foreground mb-3 text-sm font-semibold">
                Specifications
              </h3>
              <dl className="space-y-2">
                <SpecRow label="Category" value={product.categoriesHierarchy} />
                <SpecRow
                  label="Use"
                  value={
                    product.isProfessional ? "Professional only" : "Retail"
                  }
                />
                <SpecRow
                  label="Returns"
                  value={product.isReturnable ? "Eligible" : "Final sale"}
                />
              </dl>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border/60 flex justify-between gap-4 border-b pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground text-right font-medium">{value}</dd>
    </div>
  )
}
