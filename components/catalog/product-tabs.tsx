"use client"

import { useState } from "react"
import type { CatalogProduct, CatalogVariation } from "@/lib/catalog"
import { PRO_RESTRICTIONS_ENABLED } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface ProductTabsProps {
  product: CatalogProduct
  selectedVariation?: CatalogVariation
}

export function ProductTabs({ product, selectedVariation }: ProductTabsProps) {
  const [active, setActive] = useState<"description" | "details">("description")

  const specs = buildSpecs(product, selectedVariation)

  return (
    <section className="border-border mt-12 border-t pt-8">
      {/* ── Mobile / tablet: tab UI ────────────────────────────────── */}
      <div className="lg:hidden">
        <div className="border-border flex gap-6 border-b" role="tablist">
          {(["description", "details"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active === tab}
              onClick={() => setActive(tab)}
              className={cn(
                "-mb-px border-b-2 pb-3 text-sm font-medium capitalize transition-colors",
                active === tab
                  ? "border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {tab === "description" ? "Description" : "Details"}
            </button>
          ))}
        </div>

        <div className="text-muted-foreground pt-6 text-sm leading-relaxed">
          {active === "description" && (
            <div className="max-w-3xl">
              <p>{product.descriptionEn || "No description available."}</p>
            </div>
          )}
          {active === "details" && <SpecsGrid specs={specs} />}
        </div>
      </div>

      {/* ── Desktop: inline sections ───────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="text-foreground mb-4 text-base font-semibold">
              Description
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.descriptionEn || "No description available."}
            </p>
          </div>
          <div>
            <h3 className="text-foreground mb-4 text-base font-semibold">
              Details &amp; Specifications
            </h3>
            <SpecsGrid specs={specs} />
          </div>
        </div>
      </div>
    </section>
  )
}

function buildSpecs(
  product: CatalogProduct,
  variation?: CatalogVariation,
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = []

  const topCategory = product.categoriesHierarchy.split(" > ")[0]
  if (topCategory) rows.push({ label: "Category", value: topCategory })

  rows.push({
    label: "Use",
    value:
      PRO_RESTRICTIONS_ENABLED && product.isProfessional
        ? "Professional only"
        : "Retail",
  })

  rows.push({
    label: "Returns",
    value: product.isReturnable ? "Eligible" : "Final sale",
  })

  if (product.colorFamily)
    rows.push({ label: "Color family", value: product.colorFamily })

  if (product.packageClass)
    rows.push({ label: "Package class", value: product.packageClass })

  const weight = variation?.weightLb ?? product.variations[0]?.weightLb
  if (weight != null) rows.push({ label: "Weight", value: `${weight} lb` })

  return rows
}

function SpecsGrid({ specs }: { specs: { label: string; value: string }[] }) {
  return (
    <dl className="space-y-2">
      {specs.map(({ label, value }) => (
        <div
          key={label}
          className="border-border/60 flex justify-between gap-4 border-b pb-2"
        >
          <dt className="text-muted-foreground text-sm">{label}</dt>
          <dd className="text-foreground text-right text-sm font-medium">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
