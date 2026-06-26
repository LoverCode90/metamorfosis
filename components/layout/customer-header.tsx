"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CustomerNav } from "@/components/layout/customer-nav"
import { HeaderIconButton } from "@/components/layout/header-icon-button"
import { MobileNav } from "@/components/layout/mobile-nav"

interface CustomerHeaderProps {
  pathname: string
  isAuthenticated: boolean
  /** Show pulse placeholders on count badges until counts are known. */
  badgesLoading: boolean
  wishlistCount: number
  cartCount: number
  mobileNavOpen: boolean
  onOpenMenu: () => void
  onCloseMenu: () => void
  profileName: string
  profileEmail: string
  isGoogleUser: boolean
}

/** Top navigation bar shown to customers and guests. */
export function CustomerHeader({
  pathname,
  isAuthenticated,
  badgesLoading,
  wishlistCount,
  cartCount,
  mobileNavOpen,
  onOpenMenu,
  onCloseMenu,
  profileName,
  profileEmail,
  isGoogleUser,
}: CustomerHeaderProps) {
  const router = useRouter()

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

        <CustomerNav pathname={pathname} />

        <div className="flex items-center gap-1 sm:gap-2">
          <HeaderIconButton
            label="Search"
            onClick={() => router.push("/search")}
            active={pathname.startsWith("/search")}
            className="hidden sm:flex"
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </HeaderIconButton>

          <HeaderIconButton
            label="Wishlist"
            badge={wishlistCount}
            loading={badgesLoading}
            onClick={() => router.push("/wishlist")}
            active={pathname === "/wishlist"}
            className="hidden sm:flex"
          >
            <Heart className="h-5 w-5" strokeWidth={1.75} />
          </HeaderIconButton>

          <HeaderIconButton
            label="Shopping bag"
            badge={cartCount}
            loading={badgesLoading}
            onClick={() => router.push("/cart")}
            active={pathname === "/cart" || pathname === "/checkout"}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
          </HeaderIconButton>

          {isAuthenticated ? (
            <HeaderIconButton
              label="Profile"
              onClick={() => router.push("/profile")}
              active={pathname.startsWith("/profile")}
              className="hidden sm:flex"
            >
              <User className="h-5 w-5" strokeWidth={1.75} />
            </HeaderIconButton>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onOpenMenu}
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            className="ml-1 h-9 w-9 md:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <MobileNav
        open={mobileNavOpen}
        onClose={onCloseMenu}
        pathname={pathname}
        profileName={profileName}
        profileEmail={profileEmail}
        wishlistCount={wishlistCount}
        isGoogleUser={isGoogleUser}
      />
    </header>
  )
}
