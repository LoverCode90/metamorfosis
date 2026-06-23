"use client"

import { Check, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { CompletionRing } from "./completion-ring"
import { VerificationPanel } from "./verification-panel"
import { ChangePasswordForm } from "./change-password-form"
import { ProfileHeader } from "./profile-header"
import { ProfileInfoSection } from "./profile-info-section"
import { ProfileAddressSection } from "./profile-address-section"
import { SignOutButton } from "@/components/auth/sign-out-button"

export function ProfileDashboard() {
  const router = useRouter()
  const {
    user,
    profile,
    dbProfile,
    updateProfile,
    verificationStatus,
    savedAddress,
    saveAddress,
  } = useUser()

  const isAdmin = dbProfile?.role === "admin"
  const isEmailUser = user?.app_metadata?.provider !== "google"
  const hasName =
    profile.firstName.trim().length > 0 && profile.lastName.trim().length > 0
  const hasSavedPayment = false

  const checklist = [
    { id: "name", label: "Add your name", done: hasName },
    {
      id: "address",
      label: "Save a shipping address",
      done: Boolean(savedAddress),
    },
    { id: "payment", label: "Save a payment method", done: hasSavedPayment },
    ...(!isAdmin
      ? [
          {
            id: "verify",
            label: "Verify your professional license",
            done: verificationStatus === "verified",
          },
        ]
      : []),
  ]
  const completion = Math.round(
    (checklist.filter((c) => c.done).length / checklist.length) * 100,
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          My Account
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Profile
        </h1>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <ProfileHeader
            profile={profile}
            role={dbProfile?.role ?? "standard_customer"}
            verificationStatus={verificationStatus}
          />

          <ProfileInfoSection profile={profile} updateProfile={updateProfile} />

          <VerificationPanel
            status={verificationStatus}
            rejectionReason={dbProfile?.rejection_reason}
          />

          <ProfileAddressSection
            savedAddress={savedAddress}
            saveAddress={saveAddress}
            user={user}
            email={dbProfile?.email ?? profile.email}
          />

          <section className="border-border bg-card rounded-2xl border p-6">
            <h3 className="text-foreground text-sm font-semibold">Activity</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push("/orders")}
                className="border-border bg-background hover:bg-muted flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors"
              >
                <span className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
                  <Package
                    className="text-foreground h-4 w-4"
                    strokeWidth={1.75}
                  />
                </span>
                <span className="text-foreground text-sm font-semibold">
                  My Orders
                </span>
                <span className="text-muted-foreground text-xs">
                  View order history &amp; receipts
                </span>
                <span className="text-foreground mt-1 text-xs font-medium underline underline-offset-2">
                  View orders
                </span>
              </button>
            </div>
          </section>

          {/* Change password — email/password users only, not Google OAuth */}
          {isEmailUser && <ChangePasswordForm />}

          <section className="border-border bg-card rounded-2xl border p-6">
            <h3 className="text-foreground mb-4 text-sm font-semibold">
              Account
            </h3>
            <SignOutButton />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="border-border bg-card rounded-2xl border p-6">
            <h3 className="text-foreground text-sm font-semibold">
              Complete your profile
            </h3>
            <div className="mt-5 flex justify-center">
              <CompletionRing
                value={completion}
                ringClassName="text-accent-violet"
              />
            </div>
            <ul className="mt-6 flex flex-col gap-2.5">
              {checklist.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      c.done
                        ? "border-accent-violet bg-accent-violet text-white"
                        : "border-border text-transparent",
                    )}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span
                    className={cn(
                      c.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
