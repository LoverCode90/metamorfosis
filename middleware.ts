import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

/**
 * Protected routes matched by an exact path comparison.
 * These have no sub-routes, so a prefix match would wrongly capture siblings
 * (e.g. "/verify" must NOT match the public "/verify-email" auth page).
 */
const EXACT_PROTECTED = [
  "/verify",
  "/cart/verify",
  "/orders",
  "/tracking",
  "/wishlist",
]

/**
 * Protected routes matched by prefix, because they own nested paths
 * (e.g. "/admin/products", "/checkout/payment").
 */
const PREFIX_PROTECTED = ["/profile", "/checkout", "/admin"]

/**
 * Routes that authenticated users should be redirected away from.
 */
const AUTH_ROUTES = ["/login", "/signup", "/verify-email"]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh the session — must use getUser() to verify with the auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected =
    EXACT_PROTECTED.some((route) => pathname === route) ||
    PREFIX_PROTECTED.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && user) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = "/profile"
    homeUrl.search = ""
    return NextResponse.redirect(homeUrl)
  }

  // ── Admins never see the shopping interface ───────────────────────────────
  // Bounce admins off the home page and all customer-facing routes (profile,
  // catalog, cart, checkout, wishlist, search) to /admin so they can't land on
  // the shopping view.
  const CUSTOMER_ONLY_PREFIXES = [
    "/profile",
    "/products",
    "/cart",
    "/checkout",
    "/wishlist",
    "/search",
    "/orders",
    "/tracking",
  ]
  const isCustomerRoute =
    pathname === "/" ||
    CUSTOMER_ONLY_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    )
  if (user && isCustomerRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: string }>()
    if (profile?.role === "admin") {
      const adminUrl = request.nextUrl.clone()
      adminUrl.pathname = "/admin"
      adminUrl.search = ""
      return NextResponse.redirect(adminUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, robots.txt, sitemap.xml
     * - /auth/callback (Supabase OAuth handler)
     * - /api/auth/* (auth API routes)
     * - /api/webhooks/* (third-party webhooks — no session needed)
     * - any path containing a file extension (e.g. .png, .jpg)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|auth/callback|api/auth|api/webhooks|[^/]+\\.[^/]+$).*)",
  ],
}
