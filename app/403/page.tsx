import Link from "next/link"
import { ShieldOff } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Access denied — Metamorfosis Beauty",
}

export default function ForbiddenPage() {
  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
        <ShieldOff
          className="text-muted-foreground h-7 w-7"
          strokeWidth={1.5}
        />
      </span>
      <h1 className="text-foreground mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Access denied
      </h1>
      <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
        You don&apos;t have permission to view this page. If you believe this is
        a mistake, contact the store administrator.
      </p>
      <Link
        href="/"
        className="bg-foreground text-background mt-8 inline-flex h-10 items-center rounded-md px-6 text-sm font-semibold transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  )
}
