"use client"

import { CheckoutClient } from "@/components/checkout/checkout-client"
import { CartProvider, useCart } from "./cart-context"
import { StoreHeader } from "./store-header"
import { PlaceholderPage } from "./placeholder-page"
import { CartView } from "./cart/cart-view"
import { ConfirmationView } from "./confirmation/confirmation-view"
import { ProductsPage } from "./products/products-page"
import { ProductDetailPage } from "./products/product-detail-page"
import { AboutPage } from "./about/about-page"
import { AuthPage } from "./auth/auth-page"
import { HomePage } from "./home/home-page"
import { VerifyPage } from "./verify/verify-page"
import { WishlistView } from "./wishlist/wishlist-view"
import { ProfileDashboard } from "./profile/profile-dashboard"
import { TrackingView } from "./profile/tracking-view"

function ActiveView() {
  const { view } = useCart()

  switch (view) {
    case "home":
      return <HomePage />
    case "products":
      return <ProductsPage />
    case "product-detail":
      return <ProductDetailPage />
    case "about":
      return <AboutPage />
    case "login":
      return <AuthPage mode="login" />
    case "signup":
      return <AuthPage mode="signup" />
    case "verify":
      return <VerifyPage />
    case "wishlist":
      return <WishlistView />
    case "profile":
      return <ProfileDashboard />
    case "tracking":
      return <TrackingView />
    case "cart":
      return <CartView />
    case "checkout":
      return <CheckoutClient />
    case "confirmation":
      return <ConfirmationView />
    default:
      return <PlaceholderPage view={view} />
  }
}

export function StoreApp() {
  return (
    <CartProvider>
      <div className="bg-background flex min-h-dvh flex-col">
        <StoreHeader />
        <main className="flex-1">
          <ActiveView />
        </main>
      </div>
    </CartProvider>
  )
}
