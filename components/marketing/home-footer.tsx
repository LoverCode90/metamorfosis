import Link from "next/link"
import type { ReactNode } from "react"
import { Home, Info, ShoppingBag } from "lucide-react"

import { StoreMap } from "@/components/marketing/store-map"
import { EMAIL_ADDRESSES } from "@/lib/email/addresses"
import { PICKUP_ADDRESS } from "@/lib/checkout/pickup"
import { cn } from "@/lib/utils"

const GOOGLE_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PICKUP_ADDRESS)}`

const MENU_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Products", href: "/products", icon: ShoppingBag },
  { label: "About", href: "/about", icon: Info },
] as const

const SOCIAL_LINKS = [
  {
    label: "TikTok",
    href: "https://tiktok.com/@metamorfosisllc",
    path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/metamorfosisllc",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/metamorfosisllc",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
] as const

const FOOTER_TILE_CLASS =
  "bg-neutral-950 relative overflow-hidden border border-white/5 text-white transition-opacity hover:opacity-90"

function FooterTileGlow() {
  return (
    <div
      className="pointer-events-none absolute -top-10 -right-8 h-24 w-24 rounded-full bg-violet-500/30 blur-3xl"
      aria-hidden
    />
  )
}

function FooterMenuTile({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        FOOTER_TILE_CLASS,
        "flex aspect-square flex-col items-center justify-center gap-2 rounded-xl p-3",
        className,
      )}
    >
      <FooterTileGlow />
      <div className="relative z-10 flex flex-col items-center justify-center gap-2">
        {children}
      </div>
    </div>
  )
}

function FooterSocialTile({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        FOOTER_TILE_CLASS,
        "flex h-10 w-10 items-center justify-center rounded-md",
      )}
    >
      <FooterTileGlow />
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export function HomeFooter() {
  return (
    <footer className="border-border bg-background border-t pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 xl:max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="relative block min-h-[360px] w-full overflow-hidden rounded-3xl lg:min-h-[460px]">
            <StoreMap className="rounded-3xl" />
          </div>

          <div className="flex flex-col gap-9">
            <div>
              <p className="text-foreground text-xs font-bold tracking-wider uppercase">
                Menu
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href} className="block">
                    <FooterMenuTile>
                      <Icon className="h-7 w-7 shrink-0" strokeWidth={1.75} />
                      <span className="text-xs font-medium">{label}</span>
                    </FooterMenuTile>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-border border-t" />

            <div>
              <p className="text-foreground text-sm font-semibold">
                Contact us
              </p>
              <div className="text-muted-foreground mt-3 flex flex-col gap-1.5 text-sm">
                <a
                  href={`mailto:${EMAIL_ADDRESSES.customerSupport}`}
                  className="hover:text-foreground transition-colors"
                >
                  {EMAIL_ADDRESSES.customerSupport}
                </a>
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  {PICKUP_ADDRESS}
                </a>
                <a
                  href="tel:+19092780535"
                  className="hover:text-foreground transition-colors"
                >
                  +1 (909) 278-0535
                </a>
              </div>
            </div>

            <div className="border-border border-t pt-6">
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map(({ label, href, path }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                  >
                    <FooterSocialTile>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={path} />
                      </svg>
                    </FooterSocialTile>
                  </a>
                ))}
              </div>
            </div>

            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Metamorfosis LLC. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
