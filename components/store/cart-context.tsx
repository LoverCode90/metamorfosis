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
} from "@/lib/checkout"

interface OrderDetails {
  email: string
  shipName: string
  shipAddress: string
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

  // Professional license verification
  hasProItems: boolean
  verified: boolean
  setVerified: (value: boolean) => void

  // Order lifecycle
  order: Order | null
  orderCanceled: boolean
  placeOrder: (details: OrderDetails) => void
  cancelOrder: () => void
  resetAndShop: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<StoreView>("cart")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART)
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [order, setOrder] = useState<Order | null>(null)
  const [orderCanceled, setOrderCanceled] = useState(false)
  const [verified, setVerified] = useState(false)

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

  const placeOrder = useCallback((details: OrderDetails) => {
    setOrderCanceled(false)
    setItems((current) => {
      setOrder(createOrder(current, details))
      return current
    })
    setView("confirmation")
  }, [])

  const cancelOrder = useCallback(() => {
    setOrderCanceled(true)
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
      hasProItems,
      verified,
      setVerified,
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
      hasProItems,
      verified,
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
