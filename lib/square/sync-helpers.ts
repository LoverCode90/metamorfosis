import "server-only"

export interface CategoryNode {
  id: string
  name: string
  parentId: string | null
}

/**
 * Square priceMoney.amount is always in the smallest currency unit (cents for USD).
 * Store this integer directly in product_variations.price_cents.
 */
export function parseSquarePriceCents(
  amount: bigint | number | undefined | null,
): number {
  if (amount == null) return 0
  const cents = typeof amount === "bigint" ? Number(amount) : amount
  return Math.round(cents)
}

export function resolveImageUrls(
  imageIds: string[],
  imageUrlMap: Map<string, string>,
): string[] {
  const seen = new Set<string>()
  const urls: string[] = []
  for (const id of imageIds) {
    const url = imageUrlMap.get(id)
    if (!url || seen.has(url)) continue
    seen.add(url)
    urls.push(url)
  }
  return urls
}

function buildCategoryHierarchy(
  categoryId: string,
  categoryMap: Map<string, CategoryNode>,
): string | null {
  const node = categoryMap.get(categoryId)
  if (!node) return null

  if (node.parentId) {
    const parent = categoryMap.get(node.parentId)
    if (parent) {
      return `${parent.name} > ${node.name}`
    }
  }

  return node.name
}

export function resolveItemCategoryHierarchy(
  itemData: {
    categories?: { id?: string }[] | null
    categoryId?: string | null
    reportingCategory?: { id?: string } | null
  },
  categoryMap: Map<string, CategoryNode>,
): string {
  const categoryIds: string[] = []

  for (const cat of itemData.categories ?? []) {
    if (cat.id) categoryIds.push(cat.id)
  }

  if (categoryIds.length === 0 && itemData.categoryId) {
    categoryIds.push(itemData.categoryId)
  }

  if (categoryIds.length === 0 && itemData.reportingCategory?.id) {
    categoryIds.push(itemData.reportingCategory.id)
  }

  const hierarchies = categoryIds
    .map((id) => buildCategoryHierarchy(id, categoryMap))
    .filter((h): h is string => Boolean(h))

  if (hierarchies.length === 0) return "Uncategorized"
  return hierarchies[0]
}
