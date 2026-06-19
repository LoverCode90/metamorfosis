/**
 * Injects or replaces the `width` param on a Square CDN image URL.
 * Returns null if the URL is empty/null — caller renders <PlaceholderImage />.
 *
 * 100% of resizing is delegated to Square's CDN. No Next.js image processing.
 */
export function squareImageUrl(
  url: string | null | undefined,
  width: number,
): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    parsed.searchParams.set("width", String(width))
    parsed.searchParams.set("fit", "bounds")
    return parsed.toString()
  } catch {
    return url
  }
}
