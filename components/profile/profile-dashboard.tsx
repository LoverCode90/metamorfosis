"use client"

import type React from "react"
import { useState } from "react"
import {
  BadgeCheck,
  Check,
  GraduationCap,
  Home,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
  Star,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { SavedAddress, UserRole, VerificationStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { CompletionRing } from "./completion-ring"
import { EditableField } from "./editable-field"
import { VerificationPanel } from "./verification-panel"
import { AvatarInitials } from "./avatar-initials"
import { SignOutButton } from "@/components/auth/sign-out-button"

export function ProfileDashboard() {
  const router = useRouter()
  const {
    profile,
    dbProfile,
    updateProfile,
    verificationStatus,
    savedAddress,
    saveAddress,
  } = useUser()
  const [editingAddress, setEditingAddress] = useState(false)
  const [addrDraft, setAddrDraft] = useState<SavedAddress>({
    fullName: "",
    line1: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
  })

  const isAdmin = dbProfile?.role === "admin"
  const hasName =
    profile.firstName.trim().length > 0 && profile.lastName.trim().length > 0
  // Saved payment method: no persistence layer yet — keep as false placeholder.
  const hasSavedPayment = false

  const checklist = [
    { id: "name", label: "Add your name", done: hasName },
    {
      id: "address",
      label: "Save a shipping address",
      done: Boolean(savedAddress),
    },
    {
      id: "payment",
      label: "Save a payment method",
      done: hasSavedPayment,
    },
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
          <section className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center">
            <AvatarInitials
              firstName={profile.firstName}
              lastName={profile.lastName}
              size={80}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-foreground text-lg font-semibold">
                  {profile.name || "Your name"}
                </h2>
                <ProfileBadges
                  role={dbProfile?.role ?? "standard_customer"}
                  verificationStatus={verificationStatus}
                />
              </div>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {profile.email}
              </p>
              {profile.location && (
                <p className="text-muted-foreground mt-0.5 inline-flex items-center gap-1 text-sm">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {profile.location}
                </p>
              )}
            </div>
          </section>

          <EditableField
            label="First name"
            value={profile.firstName}
            onSave={(v) => updateProfile({ first_name: v })}
          />
          <EditableField
            label="Last name"
            value={profile.lastName}
            onSave={(v) => updateProfile({ last_name: v })}
          />
          <EditableField
            label="Email address"
            value={profile.email}
            type="email"
            readOnly
          />

          <VerificationPanel
            status={verificationStatus}
            rejectionReason={dbProfile?.rejection_reason}
          />

          {/* Saved addresses */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-sm font-semibold">
                Saved Address
              </h3>
              {!editingAddress && (
                <button
                  type="button"
                  onClick={() => {
                    setAddrDraft(
                      savedAddress ?? {
                        fullName: "",
                        line1: "",
                        city: "",
                        region: "",
                        postalCode: "",
                        country: "",
                      },
                    )
                    setEditingAddress(true)
                  }}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {savedAddress ? "Edit" : "Add address"}
                </button>
              )}
            </div>

            {!editingAddress ? (
              savedAddress ? (
                <address className="text-muted-foreground mt-4 flex flex-col gap-1 text-sm not-italic">
                  <span className="text-foreground font-medium">
                    {savedAddress.fullName}
                  </span>
                  <span>{savedAddress.line1}</span>
                  <span>
                    {savedAddress.city}, {savedAddress.region}{" "}
                    {savedAddress.postalCode}
                  </span>
                  <span>{savedAddress.country}</span>
                </address>
              ) : (
                <p className="text-muted-foreground mt-4 text-sm">
                  No address saved yet.
                </p>
              )
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {(
                  [
                    { key: "fullName", label: "Full name" },
                    { key: "line1", label: "Address line 1" },
                    { key: "city", label: "City" },
                    { key: "region", label: "State / Province" },
                    { key: "postalCode", label: "Postal code" },
                    { key: "country", label: "Country" },
                  ] as { key: keyof SavedAddress; label: string }[]
                ).map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-muted-foreground mb-1 block text-xs">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={addrDraft[key]}
                      onChange={(e) =>
                        setAddrDraft((d) => ({ ...d, [key]: e.target.value }))
                      }
                      className="border-border bg-background text-foreground focus:border-foreground h-9 w-full rounded-md border px-3 text-sm transition-colors outline-none"
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      saveAddress(addrDraft)
                      setEditingAddress(false)
                    }}
                    className="bg-accent-violet h-9 rounded-md px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Save address
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingAddress(false)}
                    className="border-border text-foreground hover:bg-muted h-9 rounded-md border px-4 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

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

/**
 * Single source of truth for profile badges.
 *
 * Rules:
 *  - admin                                    → Admin chip only
 *  - professional|student|salon_owner+verified → role chip + Verified chip
 *  - everything else                           → Standard chip
 */
function ProfileBadges({
  role,
  verificationStatus,
}: {
  role: UserRole
  verificationStatus: VerificationStatus
}) {
  if (role === "admin") {
    return (
      <Chip
        label="Admin"
        icon={ShieldCheck}
        className="border-accent-violet bg-accent-violet text-white"
      />
    )
  }

  const isPro =
    role === "professional" || role === "student" || role === "salon_owner"

  if (isPro && verificationStatus === "verified") {
    const roleConfig: Record<
      "professional" | "student" | "salon_owner",
      { label: string; icon: React.ElementType }
    > = {
      professional: { label: "Professional", icon: Star },
      student: { label: "Student", icon: GraduationCap },
      salon_owner: { label: "Salon Owner", icon: Home },
    }
    const { label, icon } =
      roleConfig[role as "professional" | "student" | "salon_owner"]
    return (
      <>
        <Chip
          label={label}
          icon={icon}
          className="border-accent-amber/40 bg-accent-amber/10 text-accent-amber"
        />
        <Chip
          label="Verified"
          icon={BadgeCheck}
          className="border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald"
        />
      </>
    )
  }

  return (
    <Chip
      label="Standard"
      icon={User}
      className="border-border text-muted-foreground"
    />
  )
}

function Chip({
  label,
  icon: Icon,
  className,
}: {
  label: string
  icon: React.ElementType
  className: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        className,
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {label}
    </span>
  )
}
