/* eslint-disable @next/next/no-img-element */
"use client"

import type React from "react"
import { useState } from "react"
import {
  BadgeCheck,
  Check,
  Clock,
  GraduationCap,
  Home,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
  Star,
  User,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { SavedAddress, UserRole, VerificationStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { CompletionRing } from "./completion-ring"
import { EditableField } from "./editable-field"
import { VerificationPanel } from "./verification-panel"

export function ProfileDashboard() {
  const router = useRouter()
  const {
    profile,
    dbProfile,
    updateProfile,
    verificationStatus,
    submitVerification,
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
  const checklist = [
    {
      id: "name",
      label: "Add your name",
      done: profile.name.trim().length > 0,
    },
    {
      id: "location",
      label: "Set your location",
      done: profile.location.trim().length > 0,
    },
    {
      id: "bio",
      label: "Write a short bio",
      done: profile.bio.trim().length >= 20,
    },
    {
      id: "address",
      label: "Save a shipping address",
      done: Boolean(savedAddress),
    },
    {
      id: "verify",
      label: "Verify your professional license",
      done: verificationStatus === "verified",
    },
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
            <img
              src={profile.avatar || "/placeholder.svg"}
              alt={profile.name}
              className="border-border h-20 w-20 shrink-0 rounded-full border object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-foreground text-lg font-semibold">
                  {profile.name}
                </h2>
                <VerificationBadge status={verificationStatus} />
                {dbProfile?.role && <RoleBadge role={dbProfile.role} />}
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
            label="Display name"
            value={profile.name}
            onSave={(v) => updateProfile({ full_name: v })}
          />
          <EditableField
            label="Email address"
            value={profile.email}
            type="email"
            readOnly
          />
          <EditableField
            label="Business name"
            value={profile.location}
            onSave={(v) => updateProfile({ business_name: v })}
          />
          <EditableField
            label="Bio"
            value={profile.bio}
            multiline
            onSave={(v) => updateProfile({ bio: v })}
          />

          <VerificationPanel
            status={verificationStatus}
            email={profile.email}
            onSubmit={submitVerification}
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
                    className="bg-foreground text-background h-9 rounded-md px-4 text-sm font-semibold transition-opacity hover:opacity-90"
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
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="border-border bg-card rounded-2xl border p-6">
            <h3 className="text-foreground text-sm font-semibold">
              Complete your profile
            </h3>
            <div className="mt-5 flex justify-center">
              <CompletionRing value={completion} />
            </div>
            <ul className="mt-6 flex flex-col gap-2.5">
              {checklist.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      c.done
                        ? "border-foreground bg-foreground text-background"
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

function RoleBadge({ role }: { role: UserRole }) {
  const config: Record<
    UserRole,
    { label: string; icon: React.ElementType; className: string }
  > = {
    standard_customer: {
      label: "Standard",
      icon: User,
      className: "border-border text-muted-foreground",
    },
    student: {
      label: "Student",
      icon: GraduationCap,
      className: "border-blue-500/40 bg-blue-500/10 text-blue-500",
    },
    professional: {
      label: "Professional",
      icon: Star,
      className: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    },
    salon_owner: {
      label: "Salon Owner",
      icon: Home,
      className: "border-purple-500/40 bg-purple-500/10 text-purple-500",
    },
    admin: {
      label: "Admin",
      icon: ShieldCheck,
      className: "border-foreground bg-foreground text-background",
    },
  }
  const { label, icon: Icon, className } = config[role]

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

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = {
    regular: {
      label: "Standard",
      icon: ShieldCheck,
      className: "border-border text-muted-foreground",
    },
    pending: {
      label: "Verification pending",
      icon: Clock,
      className: "border-foreground/30 bg-muted text-foreground",
    },
    verified: {
      label: "Verified Professional",
      icon: BadgeCheck,
      className: "border-foreground bg-foreground text-background",
    },
    rejected: {
      label: "Rejected",
      icon: ShieldCheck,
      className: "border-destructive text-destructive",
    },
  }[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        config.className,
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {config.label}
    </span>
  )
}
