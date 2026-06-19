import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="text-foreground/5 text-[9rem] leading-none font-semibold tabular-nums select-none">
        404
      </p>
      <h1 className="text-foreground -mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Page not found
      </h1>
      <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-foreground text-background mt-8 inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to home
      </Link>
    </div>
  )
}
