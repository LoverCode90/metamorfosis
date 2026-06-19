import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

/**
 * Routes that require a signed-in user.
 * Middleware will redirect to /login?next=<path> when the session is absent.
 */
const PROTECTED_ROUTES = ["/profile", "/checkout", "/cart/verify", "/admin"]

/**
 * Routes that authenticated users should be redirected away from.
 */
const AUTH_ROUTES = ["/login", "/signup"]

export async function proxy(request: NextRequest) {
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

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  )
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
     * - any path containing a file extension (e.g. .png, .jpg)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|auth/callback|api/auth|[^/]+\\.[^/]+$).*)",
  ],
}
