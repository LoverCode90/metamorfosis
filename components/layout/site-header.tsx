"use client"

import { usePathname } from "next/navigation"

import { AdminHeader } from "@/components/layout/admin-header"
import { CustomerHeader } from "@/components/layout/customer-header"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import { useCart } from "@/hooks/use-cart"
import { useMounted } from "@/hooks/use-mounted"
import { useUser } from "@/hooks/use-user"
import { useCartStore } from "@/stores/cart"
import { useUiStore } from "@/stores/ui"
import { useWishlistStore } from "@/stores/wishlist"

export function SiteHeader() {
  const pathname = usePathname()
  useCart() // triggers cart + wishlist Supabase sync on every page
  const { user, profile, dbProfile, isLoading } = useUser()
  const { mobileNavOpen, openMobileNav, closeMobileNav } = useUiStore()
  const cartCount = useCartStore((s) => s.totals.itemCount)
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const mounted = useMounted()

  useBodyScrollLock(mobileNavOpen)

  if (dbProfile?.role === "admin") {
    return <AdminHeader pathname={pathname} onOpenMenu={openMobileNav} />
  }

  const isGoogleUser = user?.app_metadata?.provider === "google"

  return (
    <CustomerHeader
      pathname={pathname}
      isAuthenticated={!!user}
      badgesLoading={!mounted || (user !== null && isLoading)}
      wishlistCount={wishlistCount}
      cartCount={cartCount}
      mobileNavOpen={mobileNavOpen}
      onOpenMenu={openMobileNav}
      onCloseMenu={closeMobileNav}
      profileName={profile.name}
      profileEmail={profile.email}
      isGoogleUser={!!isGoogleUser}
    />
  )
}
