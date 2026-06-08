import { HelpCircle, Lock, ShoppingBag } from "lucide-react"

export function CheckoutNavbar() {
  return (
    <header className="border-b border-border/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-foreground text-background">
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <span className="text-sm font-semibold tracking-[0.2em] text-foreground">
            METAMORFOSIS LAB
          </span>
        </a>

        <nav className="flex items-center gap-5 text-muted-foreground">
          <span className="hidden items-center gap-1.5 text-xs font-medium sm:flex">
            <Lock className="h-3.5 w-3.5" />
            Secure Checkout
          </span>
          <button
            type="button"
            aria-label="Help"
            className="transition-colors hover:text-foreground"
          >
            <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </nav>
      </div>
    </header>
  )
}
