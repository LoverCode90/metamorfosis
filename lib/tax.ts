import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { TAX_RATE } from "@/lib/constants"

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

type TaxSource = "cdtfa" | "salestaxzip" | "fallback"

export async function getTaxRate(zip: string, state: string): Promise<number> {
  const admin = createAdminClient()

  const { data: cached } = await admin
    .from("zip_tax_cache")
    .select("rate, updated_at")
    .eq("zip", zip)
    .single()

  if (cached) {
    const ageMs = Date.now() - new Date(cached.updated_at).getTime()
    if (ageMs < CACHE_TTL_MS) return Number(cached.rate)
  }

  let rate = TAX_RATE
  let source: TaxSource = "fallback"

  try {
    if (state === "CA") {
      rate = await fetchCdtfaRate(zip)
      source = "cdtfa"
    } else {
      rate = await fetchSalesTaxZipRate(zip)
      source = "salestaxzip"
    }
  } catch (err) {
    console.warn("[tax] API lookup failed, using fallback rate:", err)
  }

  await admin
    .from("zip_tax_cache")
    .upsert(
      { zip, state, rate, source, updated_at: new Date().toISOString() },
      { onConflict: "zip" },
    )

  return rate
}

async function fetchCdtfaRate(zip: string): Promise<number> {
  const url =
    `https://services.maps.cdtfa.ca.gov/api/taxrate/GetRateByAddress` +
    `?city=&zip=${encodeURIComponent(zip)}&address=`
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
  if (!res.ok) throw new Error(`CDTFA ${res.status}`)
  const json: unknown = await res.json()
  const rate = (json as { taxRateInfo?: { rate?: unknown }[] })
    ?.taxRateInfo?.[0]?.rate
  if (typeof rate !== "number")
    throw new Error("CDTFA unexpected response shape")
  return rate / 100
}

async function fetchSalesTaxZipRate(zip: string): Promise<number> {
  const url = `https://salestaxzip.com/api/v1/rate/${encodeURIComponent(zip)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
  if (!res.ok) throw new Error(`SalesTaxZip ${res.status}`)
  const json: unknown = await res.json()
  const rate = (json as { data?: { rates?: { combined?: unknown } } })?.data
    ?.rates?.combined
  if (typeof rate !== "number")
    throw new Error("SalesTaxZip unexpected response shape")
  return rate
}
