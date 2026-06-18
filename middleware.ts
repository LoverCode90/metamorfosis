import { NextResponse } from "next/server"

// Phase 3: auth guards, rate limits, locale routing
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
