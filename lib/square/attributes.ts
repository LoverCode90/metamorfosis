import "server-only"

import type { CatalogCustomAttributeValue } from "square"

type AttrMap = Record<string, CatalogCustomAttributeValue> | undefined

/**
 * Read a string custom attribute by key (case-insensitive key lookup).
 */
export function getStringAttr(attrs: AttrMap, key: string): string | null {
  if (!attrs) return null
  const entry = findAttr(attrs, key)
  return entry?.stringValue ?? null
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
  // SELECTION type: selectionUidValues contains the chosen uid; the definition
  // maps uid → display name "true" / "false". We also try stringValue.
  const sv = entry.stringValue?.toLowerCase()
  if (sv === "true") return true
  if (sv === "false") return false
  // Some stores use selectionUidValues — check the key name as proxy
  const uids = entry.selectionUidValues
  if (uids && uids.length > 0) {
    // We can't resolve UIDs without the definition, so fall back to presence
    return null
  }
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
 * Case-insensitive lookup — handles both plain keys ("is_professional")
 * and app-prefixed keys ("abcd1234:is_professional").
 */
function findAttr(
  attrs: Record<string, CatalogCustomAttributeValue>,
  key: string,
): CatalogCustomAttributeValue | undefined {
  const lower = key.toLowerCase()
  for (const [k, v] of Object.entries(attrs)) {
    const bare = k.includes(":") ? k.split(":").pop()! : k
    if (bare.toLowerCase() === lower) return v
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
