import { Suspense } from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { SignInForm } from "@/components/auth/sign-in-form"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Sign in — Metamorfosis Beauty",
  description: "Sign in to your Metamorfosis account.",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to your Metamorfosis account
          </p>
        </div>

        <OAuthButtons mode="signin" redirectTo="/profile" />

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs tracking-wider uppercase">
            or
          </span>
          <Separator className="flex-1" />
        </div>

        {/* SignInForm uses useSearchParams — must be in Suspense */}
        <Suspense>
          <SignInForm />
        </Suspense>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {"Don't have an account? "}
          <Link
            href="/signup"
            className="text-foreground font-medium underline underline-offset-2"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
