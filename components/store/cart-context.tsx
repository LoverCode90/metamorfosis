"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  INITIAL_CART,
  computeTotals,
  createOrder,
  type CartItem,
  type Order,
  type Product,
  type StoreView,
  type Totals,
  type UserProfile,
  type SavedAddress,
  type VerificationStatus,
} from "@/lib/checkout"
import { sendEmail } from "@/lib/email"

interface OrderDetails {
  email: string
  shipName: string
  shipAddress: string
}

const INITIAL_PROFILE: UserProfile = {
  name: "Ronald Richards",
  email: "ronald@example.com",
  location: "Los Angeles, CA",
  bio: "Independent colorist focused on dimensional blondes and bond-safe lightening. Building a private studio practice.",
  avatar: "/professional-hair-colorist-portrait.png",
  status: "regular",
}

const INITIAL_ADDRESS: SavedAddress = {
  fullName: "Ronald Richards",
  line1: "8721 Sunset Blvd, Suite 4",
  city: "Los Angeles",
  region: "CA",
  postalCode: "90069",
  country: "United States",
}

interface CartContextValue {
  // Navigation
  view: StoreView
  setView: (view: StoreView) => void

  // Product detail navigation
  selectedProductId: string | null
  openProduct: (id: string) => void

  // Cart state
  items: CartItem[]
  wishlist: Product[]
  totals: Totals

  // Cart actions
  increment: (id: string) => void
  decrement: (id: string) => void
  removeItem: (id: string) => void
  moveToWishlist: (id: string) => void
  addToCart: (product: Product, quantity?: number) => void

  // Wishlist actions
  toggleWishlist: (product: Product) => void
  removeFromWishlist: (id: string) => void
  isWishlisted: (id: string) => boolean

  // Professional license verification
  hasProItems: boolean
  verified: boolean
  setVerified: (value: boolean) => void

  // Profile + verification status
  profile: UserProfile
  updateProfile: (patch: Partial<UserProfile>) => void
  verificationStatus: VerificationStatus
  submitVerification: () => void
  approveVerification: () => void

  // Address book
  savedAddress: SavedAddress | null
  saveAddress: (address: SavedAddress) => void

  // Order lifecycle
  order: Order | null
  orderCanceled: boolean
  placeOrder: (details: OrderDetails) => void
  cancelOrder: () => void
  resetAndShop: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<StoreView>("home")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART)
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [order, setOrder] = useState<Order | null>(null)
  const [orderCanceled, setOrderCanceled] = useState(false)
  const [verified, setVerified] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE)
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(INITIAL_ADDRESS)

  const openProduct = useCallback((id: string) => {
    setSelectedProductId(id)
    setView("product-detail")
  }, [])

  const increment = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i,
      ),
    )
  }, [])

  const decrement = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i,
      ),
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const moveToWishlist = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) {
        setWishlist((w) =>
          w.some((p) => p.id === id) ? w : [...w, stripQuantity(target)],
        )
      }
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
            : i,
        )
      }
      return [...prev, { ...product, quantity: Math.min(quantity, product.stock) }]
    })
  }, [])

  // ---- Wishlist ----
  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product],
    )
  }, [])

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // ---- Profile + verification ----
  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch }
      void sendEmail({
        to: next.email,
        template: "profile.updated",
        data: { name: next.name },
      })
      return next
    })
  }, [])

  const submitVerification = useCallback(() => {
    setProfile((prev) => {
      if (prev.status === "verified") return prev
      void sendEmail({
        to: prev.email,
        template: "verification.pending",
        data: { name: prev.name },
      })
      return { ...prev, status: "pending" }
    })
  }, [])

  const approveVerification = useCallback(() => {
    setVerified(true)
    setProfile((prev) => {
      void sendEmail({
        to: prev.email,
        template: "verification.approved",
        data: { name: prev.name },
      })
      return { ...prev, status: "verified" }
    })
  }, [])

  // ---- Address book ----
  const saveAddress = useCallback((address: SavedAddress) => {
    setSavedAddress(address)
    setProfile((prev) => {
      const location = `${address.city}, ${address.region}`
      void sendEmail({
        to: prev.email,
        template: "address.updated",
        data: { location },
      })
      return { ...prev, location }
    })
  }, [])

  const placeOrder = useCallback((details: OrderDetails) => {
    setOrderCanceled(false)
    setItems((current) => {
      const created = createOrder(current, details)
      setOrder(created)
      void sendEmail({
        to: details.email,
        template: "order.confirmation",
        data: { orderNumber: created.number, total: created.totals.total },
      })
      return current
    })
    setView("confirmation")
  }, [])

  const cancelOrder = useCallback(() => {
    setOrderCanceled(true)
    setOrder((current) => {
      if (current) {
        void sendEmail({
          to: current.email,
          template: "order.canceled",
          data: { orderNumber: current.number },
        })
      }
      return current
    })
  }, [])

  const resetAndShop = useCallback(() => {
    setItems(INITIAL_CART)
    setOrder(null)
    setOrderCanceled(false)
    setVerified(false)
    setView("home")
  }, [])

  const totals = useMemo(() => computeTotals(items), [items])
  const hasProItems = useMemo(
    () => items.some((i) => i.isProfessional),
    [items],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      view,
      setView,
      selectedProductId,
      openProduct,
      items,
      wishlist,
      totals,
      increment,
      decrement,
      removeItem,
      moveToWishlist,
      addToCart,
      toggleWishlist,
      removeFromWishlist,
      isWishlisted: (id: string) => wishlist.some((p) => p.id === id),
      hasProItems,
      verified,
      setVerified,
      profile,
      updateProfile,
      verificationStatus: profile.status,
      submitVerification,
      approveVerification,
      savedAddress,
      saveAddress,
      order,
      orderCanceled,
      placeOrder,
      cancelOrder,
      resetAndShop,
    }),
    [
      view,
      selectedProductId,
      openProduct,
      items,
      wishlist,
      totals,
      increment,
      decrement,
      removeItem,
      moveToWishlist,
      addToCart,
      toggleWishlist,
      removeFromWishlist,
      hasProItems,
      verified,
      profile,
      updateProfile,
      submitVerification,
      approveVerification,
      savedAddress,
      saveAddress,
      order,
      orderCanceled,
      placeOrder,
      cancelOrder,
      resetAndShop,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function stripQuantity(item: CartItem): Product {
  const { quantity: _q, ...product } = item
  return product
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
