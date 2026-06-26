/**
 * Wishlist page heading with an item count.
 * @param count - Number of saved items to display in the subtitle.
 */
export function WishlistPageHeader({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
        My Account
      </p>
      <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
        My Wishlist
      </h1>
      <p className="text-muted-foreground text-sm">
        Public List · {count} {count === 1 ? "item" : "items"}
      </p>
    </div>
  )
}
