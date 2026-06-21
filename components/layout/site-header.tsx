"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Heart, Search, ShoppingBag, User } from "lucide-react"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/stores/cart"
import { useWishlistStore } from "@/stores/wishlist"
import { useUiStore } from "@/stores/ui"
import { useUser } from "@/hooks/use-user"
import { MobileNav } from "./mobile-nav"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const cartTotals = useCartStore((s) => s.totals)
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const { user, profile } = useUser()
  const { mobileNavOpen, openMobileNav, closeMobileNav } = useUiStore()

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileNavOpen])

  return (
    <header className="border-border bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Metamorfosis Lab home"
        >
          <span className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-sm">
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <span className="text-foreground text-sm font-semibold tracking-[0.18em]">
            METAMORFOSIS
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm transition-colors",
                  active
                    ? "text-accent-violet font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {active && (
                  <span className="bg-accent-violet absolute -bottom-[21px] left-0 h-px w-full" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <HeaderIconButton label="Search" className="hidden sm:flex">
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </HeaderIconButton>

          <HeaderIconButton
            label="Wishlist"
            badge={wishlistCount}
            onClick={() => router.push("/wishlist")}
            active={pathname === "/wishlist"}
            className="hidden sm:flex"
          >
            <Heart className="h-5 w-5" strokeWidth={1.75} />
          </HeaderIconButton>

          <HeaderIconButton
            label="Shopping bag"
            badge={cartTotals.itemCount}
            onClick={() => router.push("/cart")}
            active={pathname === "/cart" || pathname === "/checkout"}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
          </HeaderIconButton>

          {user ? (
            <>
              <HeaderIconButton
                label="Profile"
                onClick={() => router.push("/profile")}
                active={pathname.startsWith("/profile")}
                className="hidden sm:flex"
              >
                <User className="h-5 w-5" strokeWidth={1.75} />
              </HeaderIconButton>
              <form
                action="/api/auth/signout"
                method="POST"
                className="hidden sm:flex"
              >
                <button
                  type="submit"
                  className="border-border text-foreground hover:bg-muted flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="border-border text-foreground hover:bg-muted hidden items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors sm:flex"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={openMobileNav}
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            className="text-foreground hover:bg-muted ml-1 flex h-9 w-9 items-center justify-center rounded-md transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <MobileNav
        open={mobileNavOpen}
        onClose={closeMobileNav}
        pathname={pathname}
        profileName={profile.name}
        profileEmail={profile.email}
        wishlistCount={wishlistCount}
      />
    </header>
  )
}

interface HeaderIconButtonProps {
  label: string
  children: React.ReactNode
  badge?: number
  onClick?: () => void
  active?: boolean
  className?: string
}

function HeaderIconButton({
  label,
  children,
  badge,
  onClick,
  active,
  className,
}: HeaderIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-md transition-colors",
        active ? "bg-muted text-foreground" : "text-foreground hover:bg-muted",
        className,
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="bg-foreground text-background absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
          {badge}
        </span>
      )}
    </button>
  )
}
