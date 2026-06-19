import Link from "next/link"
import type { Metadata } from "next"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Create account — Metamorfosis Beauty",
  description: "Sign up for a Metamorfosis Beauty account.",
}

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Join Metamorfosis Beauty — professional color &amp; care
          </p>
        </div>

        <OAuthButtons mode="signup" />

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs tracking-wider uppercase">
            or sign up with email
          </span>
          <Separator className="flex-1" />
        </div>

        <SignUpForm />

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground font-medium underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
