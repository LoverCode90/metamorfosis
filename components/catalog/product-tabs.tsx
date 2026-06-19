"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import type { CatalogProduct } from "@/lib/catalog"
import { cn } from "@/lib/utils"

interface ProductTabsProps {
  product: CatalogProduct
}

export function ProductTabs({ product }: ProductTabsProps) {
  const isColor = product.type === "color"
  const tabs = isColor
    ? (["description", "shades", "details"] as const)
    : (["description", "details"] as const)
  const [active, setActive] = useState<(typeof tabs)[number]>("description")

  const labels: Record<string, string> = {
    description: "Description",
    shades: "Shade Chart",
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
          <div className="max-w-3xl space-y-4">
            <p>{product.description}</p>
            {product.benefits.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="bg-foreground mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                    <span className="text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {active === "shades" && isColor && product.colorVariants && (
          <div className="max-w-3xl">
            <p className="mb-5">
              {product.colorVariants.length} professional tonalities. Mix 1:1.5
              with the matching developer. Download the full numbered chart for
              precise formulation.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {product.colorVariants.map((v) => (
                <div
                  key={v.id}
                  className="border-border flex items-center gap-3 rounded-lg border p-3"
                >
                  <span
                    className="ring-border h-8 w-8 shrink-0 rounded-full ring-1"
                    style={{ backgroundColor: v.hex }}
                  />
                  <span className="text-foreground text-sm font-medium">
                    {v.name}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => downloadShadeChart(product)}
              className="border-border text-foreground hover:bg-muted mt-6 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Download shade chart
            </button>
          </div>
        )}

        {active === "details" && (
          <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-foreground mb-3 text-sm font-semibold">
                Ingredients
              </h3>
              <ul className="space-y-1.5">
                {product.ingredients.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-foreground mb-3 text-sm font-semibold">
                Specifications
              </h3>
              <dl className="space-y-2">
                <SpecRow label="Brand" value={product.brand} />
                <SpecRow label="Category" value={product.category} />
                <SpecRow label="Format" value={product.variant} />
                <SpecRow
                  label="Use"
                  value={
                    product.isProfessional ? "Professional only" : "Retail"
                  }
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

/** Generates a simple printable shade chart and opens it as a data-URL PDF-ish HTML doc. */
function downloadShadeChart(product: CatalogProduct) {
  const rows =
    product.colorVariants
      ?.map(
        (v) =>
          `<tr><td><span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${v.hex};vertical-align:middle"></span></td><td style="padding-left:12px">${v.name}</td></tr>`,
      )
      .join("") ?? ""
  const html = `<!doctype html><html><head><title>${product.name} — Shade Chart</title><style>body{font-family:system-ui,sans-serif;padding:40px;color:#111}h1{font-size:20px}table{border-collapse:collapse;margin-top:24px}td{padding:8px 0;font-size:14px}</style></head><body><h1>${product.name}</h1><p>${product.colorVariants?.length} tonalities · Mix ratio 1:1.5</p><table>${rows}</table></body></html>`
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank")
}
