"use client"

import { useState } from "react"
import { Check, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  outOfStock: boolean
  onClick: () => void
  className?: string
}

export function AddToCartButton({
  outOfStock,
  onClick,
  className,
}: AddToCartButtonProps) {
  const [succeeded, setSucceeded] = useState(false)

  function handleClick() {
    if (succeeded || outOfStock) return
    onClick()
    setSucceeded(true)
    setTimeout(() => setSucceeded(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        handleClick()
      }}
      disabled={outOfStock}
      aria-label={outOfStock ? "Out of stock" : "Add to cart"}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md transition-transform active:scale-90 disabled:opacity-40",
        className,
      )}
    >
      {succeeded ? (
        <Check className="h-5 w-5" strokeWidth={2.5} />
      ) : (
        <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
      )}
    </button>
  )
}
