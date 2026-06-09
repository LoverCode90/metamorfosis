"use client"

import { CheckoutClient } from "@/components/checkout/checkout-client"
import { CartProvider, useCart } from "./cart-context"
import { StoreHeader } from "./store-header"
import { PlaceholderPage } from "./placeholder-page"
import { CartView } from "./cart/cart-view"
import { ConfirmationView } from "./confirmation/confirmation-view"
import { ProductsPage } from "./products/products-page"
import { ProductDetailPage } from "./products/product-detail-page"
import { VerifyPage } from "./verify/verify-page"
import { WishlistView } from "./wishlist/wishlist-view"
import { ProfileDashboard } from "./profile/profile-dashboard"
import { TrackingView } from "./profile/tracking-view"

function ActiveView() {
  const { view } = useCart()

  switch (view) {
    case "products":
      return <ProductsPage />
    case "product-detail":
      return <ProductDetailPage />
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
      <div className="flex min-h-dvh flex-col bg-background">
        <StoreHeader />
        <main className="flex-1">
          <ActiveView />
        </main>
      </div>
    </CartProvider>
  )
}
