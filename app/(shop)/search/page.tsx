import { fetchCatalogCards } from "@/lib/catalog/queries"
import { SearchView } from "@/components/catalog/search-view"

export const metadata = { title: "Search — Metamorfosis Beauty" }

// Search runs over the full catalog list. The page server-renders the cards
// once and the client filters them by name as the user types (debounced).
export default async function SearchPage() {
  const cards = await fetchCatalogCards()
  return <SearchView cards={cards} />
}
