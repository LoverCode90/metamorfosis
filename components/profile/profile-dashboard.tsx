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
import {
  usePlacesAutocomplete,
  type PlaceSuggestion,
} from "@/hooks/use-places-autocomplete"
import type { SavedAddress, UserRole, VerificationStatus } from "@/lib/types"
import { CONTINENTAL_STATES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { formatPhone, digits as phoneDigits } from "@/lib/utils/phone"
import { PhoneInput } from "@/components/ui/phone-input"
import { CompletionRing } from "./completion-ring"
import { EditableField } from "./editable-field"
import { VerificationPanel } from "./verification-panel"
import { AvatarInitials } from "./avatar-initials"
import { ChangePasswordForm } from "./change-password-form"
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
  const [editingAddress, setEditingAddress] = useState(false)
  const [addrDraft, setAddrDraft] = useState<SavedAddress & { phone: string }>({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    region: "",
    postalCode: "",
    country: "US",
  })

  const isAdmin = dbProfile?.role === "admin"
  const isEmailUser = user?.app_metadata?.provider !== "google"
  const hasName =
    profile.firstName.trim().length > 0 && profile.lastName.trim().length > 0
  const hasSavedPayment = false

  const { suggestions, getPlaceDetails, setSuggestions } =
    usePlacesAutocomplete(addrDraft.line1)

  async function handlePlaceSelect(placeId: string) {
    try {
      const details = await getPlaceDetails(placeId)
      let street_number = ""
      let route = ""
      let city = ""
      let state = ""
      let zip = ""

      for (const component of details.address_components || []) {
        const types = component.types
        if (types.includes("street_number")) street_number = component.long_name
        if (types.includes("route")) route = component.short_name
        if (types.includes("locality")) city = component.long_name
        if (types.includes("administrative_area_level_1"))
          state = component.short_name
        if (types.includes("postal_code")) zip = component.long_name
      }

      setAddrDraft((d) => ({
        ...d,
        line1: `${street_number} ${route}`.trim(),
        city,
        region: state,
        postalCode: zip,
      }))
      setSuggestions([])
    } catch (e) {
      console.error(e)
    }
  }

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

  function startEditing() {
    setAddrDraft({
      fullName: savedAddress?.fullName ?? "",
      phone: phoneDigits(savedAddress?.phone ?? ""),
      line1: savedAddress?.line1 ?? "",
      city: savedAddress?.city ?? "",
      region: savedAddress?.region ?? "",
      postalCode: savedAddress?.postalCode ?? "",
      country: "US",
    })
    setEditingAddress(true)
  }

  function handleSaveAddress() {
    const formatted = {
      ...addrDraft,
      phone: addrDraft.phone ? formatPhone(addrDraft.phone) : "",
      country: "US",
    }
    saveAddress(formatted)
    setEditingAddress(false)

    if (user) {
      const email = dbProfile?.email ?? profile.email
      fetch("/api/addresses/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formatted.fullName,
          email,
          phone: formatted.phone,
          streetLine1: formatted.line1,
          streetLine2: "",
          city: formatted.city,
          state: formatted.region,
          zip: formatted.postalCode,
          country: "US",
        }),
      }).catch(() => {})
    }
  }

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

          {/* Saved address */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-sm font-semibold">
                Saved Address
              </h3>
              {!editingAddress && (
                <button
                  type="button"
                  onClick={startEditing}
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
                  {savedAddress.phone && (
                    <span>{formatPhone(savedAddress.phone)}</span>
                  )}
                  <span>{savedAddress.line1}</span>
                  <span>
                    {savedAddress.city}, {savedAddress.region}{" "}
                    {savedAddress.postalCode}
                  </span>
                  <span>United States</span>
                </address>
              ) : (
                <p className="text-muted-foreground mt-4 text-sm">
                  No address saved yet.
                </p>
              )
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {/* Full name */}
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs">
                    Full name
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={addrDraft.fullName}
                    onChange={(e) =>
                      setAddrDraft((d) => ({ ...d, fullName: e.target.value }))
                    }
                    className="border-border bg-background text-foreground focus:border-foreground h-9 w-full rounded-md border px-3 text-sm transition-colors outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs">
                    Phone
                  </label>
                  <PhoneInput
                    value={addrDraft.phone}
                    onChange={(v) => setAddrDraft((d) => ({ ...d, phone: v }))}
                    className="h-9"
                  />
                </div>

                {/* Street */}
                <div className="relative">
                  <label className="text-muted-foreground mb-1 block text-xs">
                    Address line 1
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={addrDraft.line1}
                    onChange={(e) =>
                      setAddrDraft((d) => ({ ...d, line1: e.target.value }))
                    }
                    className="border-border bg-background text-foreground focus:border-foreground h-9 w-full rounded-md border px-3 text-sm transition-colors outline-none"
                  />
                  {suggestions.length > 0 && (
                    <ul className="border-border bg-background absolute z-10 mt-1 max-h-60 w-full overflow-hidden overflow-y-auto rounded-md border shadow-lg">
                      {suggestions.map((s: PlaceSuggestion) => (
                        <li
                          key={s.place_id}
                          onClick={() => handlePlaceSelect(s.place_id)}
                          className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors"
                        >
                          <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-foreground text-sm font-medium">
                              {s.main_text}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {s.secondary_text}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs">
                    City
                  </label>
                  <input
                    type="text"
                    autoComplete="address-level2"
                    value={addrDraft.city}
                    onChange={(e) =>
                      setAddrDraft((d) => ({ ...d, city: e.target.value }))
                    }
                    className="border-border bg-background text-foreground focus:border-foreground h-9 w-full rounded-md border px-3 text-sm transition-colors outline-none"
                  />
                </div>

                {/* State dropdown — 48 continental states + DC, no HI/AK */}
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs">
                    State
                  </label>
                  <select
                    value={addrDraft.region}
                    onChange={(e) =>
                      setAddrDraft((d) => ({ ...d, region: e.target.value }))
                    }
                    className="border-border bg-background text-foreground focus:border-foreground h-9 w-full rounded-md border px-3 text-sm transition-colors outline-none"
                  >
                    <option value="">Select state</option>
                    {CONTINENTAL_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Postal code */}
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs">
                    Postal code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={addrDraft.postalCode}
                    onChange={(e) =>
                      setAddrDraft((d) => ({
                        ...d,
                        postalCode: e.target.value,
                      }))
                    }
                    className="border-border bg-background text-foreground focus:border-foreground h-9 w-full rounded-md border px-3 text-sm transition-colors outline-none"
                  />
                </div>

                {/* Country — locked to continental US */}
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs">
                    Country
                  </label>
                  <div className="border-border bg-muted/40 text-muted-foreground flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm">
                    <span className="text-foreground">United States</span>
                    <span className="text-xs">Continental US only</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveAddress}
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
