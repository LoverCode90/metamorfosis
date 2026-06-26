import { HelpCircle, Lock, ShoppingBag } from "lucide-react"

export function CheckoutNavbar() {
  return (
    <header className="border-border/70 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <span className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-sm">
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <span className="text-foreground text-sm font-semibold tracking-[0.2em]">
            METAMORFOSIS LAB
          </span>
        </a>

        <nav className="text-muted-foreground flex items-center gap-5">
          <span className="hidden items-center gap-1.5 text-xs font-medium sm:flex">
            <Lock className="h-3.5 w-3.5" />
            Secure Checkout
          </span>
          <button
            type="button"
            aria-label="Help"
            className="hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </nav>
      </div>
    </header>
  )
}
