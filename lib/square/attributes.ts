import "server-only"

import type { CatalogCustomAttributeValue } from "square"

type AttrMap = Record<string, CatalogCustomAttributeValue> | undefined

/**
 * Read a string custom attribute by key (case-insensitive key lookup).
 */
export function getStringAttr(attrs: AttrMap, key: string): string | null {
  if (!attrs) return null
  const entry = findAttr(attrs, key)
  if (!entry) return null
  return entry.stringValue?.trim() ?? null
}

/**
 * Read a hex color custom attribute, normalizing to #RRGGBB when possible.
 */
export function getHexColorAttr(
  attrs: AttrMap,
  key = "hex_color",
): string | null {
  const raw = getStringAttr(attrs, key)
  if (!raw) return null
  if (/^#[0-9A-Fa-f]{3,8}$/.test(raw)) return raw.toUpperCase()
  if (/^[0-9A-Fa-f]{3,8}$/.test(raw)) return `#${raw.toUpperCase()}`
  return raw
}

/**
 * ITEM-level color chart PDF URL — tries common Square attribute key variants.
 */
export function getColorChartPdfUrl(attrs: AttrMap): string | null {
  for (const key of ["color_chart_pdf_url", "color_chart_pdf", "color_chart"]) {
    const value = getStringAttr(attrs, key)
    if (value) return value
  }
  return null
}

/**
 * Read a boolean custom attribute by key.
 * Square stores booleans as SELECTION attributes with values "true" / "false"
 * or as actual BOOLEAN type — handles both.
 */
export function getBoolAttr(attrs: AttrMap, key: string): boolean | null {
  if (!attrs) return null
  const entry = findAttr(attrs, key)
  if (!entry) return null
  if (entry.booleanValue != null) return entry.booleanValue
  const sv = entry.stringValue?.toLowerCase()
  if (sv === "true") return true
  if (sv === "false") return false
  return null
}

/**
 * Read a numeric custom attribute (stored as string) by key.
 */
export function getNumberAttr(attrs: AttrMap, key: string): number | null {
  if (!attrs) return null
  const entry = findAttr(attrs, key)
  if (!entry) return null
  if (entry.numberValue != null) {
    const n = parseFloat(entry.numberValue)
    return isNaN(n) ? null : n
  }
  if (entry.stringValue != null) {
    const n = parseFloat(entry.stringValue)
    return isNaN(n) ? null : n
  }
  return null
}

/**
 * Case-insensitive lookup — handles plain keys ("is_professional"),
 * app-prefixed keys ("abcd1234:is_professional"), and matches on entry.name.
 */
function findAttr(
  attrs: Record<string, CatalogCustomAttributeValue>,
  key: string,
): CatalogCustomAttributeValue | undefined {
  const lower = key.toLowerCase()

  for (const [k, v] of Object.entries(attrs)) {
    const bare = k.includes(":") ? k.split(":").pop()! : k
    if (bare.toLowerCase() === lower) return v
    if (v.name?.toLowerCase() === lower) return v
    if (v.key?.toLowerCase() === lower) return v
    if (
      v.key?.includes(":") &&
      v.key.split(":").pop()?.toLowerCase() === lower
    ) {
      return v
    }
  }

  return undefined
}

export type PackageClass = "tiny" | "small" | "medium" | "box_set" | "kit_large"

const VALID_PACKAGE_CLASSES: PackageClass[] = [
  "tiny",
  "small",
  "medium",
  "box_set",
  "kit_large",
]

export function getPackageClass(attrs: AttrMap): PackageClass {
  const raw = getStringAttr(attrs, "package_class")
  if (!raw) return "small"
  const v = raw.toLowerCase() as PackageClass
  return VALID_PACKAGE_CLASSES.includes(v) ? v : "small"
}

export type ColorFamily =
  | "naturals"
  | "warm"
  | "cool"
  | "pastel"
  | "special"
  | null

const VALID_FAMILIES: string[] = [
  "naturals",
  "warm",
  "cool",
  "pastel",
  "special",
]

export function getColorFamily(attrs: AttrMap): ColorFamily {
  const raw = getStringAttr(attrs, "color_family")
  if (!raw) return null
  return VALID_FAMILIES.includes(raw.toLowerCase())
    ? (raw.toLowerCase() as ColorFamily)
    : null
}
