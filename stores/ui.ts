import { create } from "zustand"

interface UiState {
  // Cart sheet
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  // Mobile nav
  mobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void

  // Search overlay
  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void

  // Checkout step (managed locally by the checkout route, but surfaced here
  // so the cart sheet can deep-link into a specific step)
  checkoutStep: number
  setCheckoutStep: (step: number) => void

  // Toast/notification queue placeholder — wired in Phase 5
  toastCount: number
}

export const useUiStore = create<UiState>()((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),

  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  checkoutStep: 0,
  setCheckoutStep: (step) => set({ checkoutStep: step }),

  toastCount: 0,
}))
