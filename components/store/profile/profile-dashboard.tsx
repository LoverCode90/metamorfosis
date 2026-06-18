"use client"

import { useEffect, useRef, useState } from "react"
import {
  BadgeCheck,
  Check,
  Clock,
  FileText,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
  Upload,
  UploadCloud,
  X,
} from "lucide-react"
import type { VerificationStatus } from "@/lib/checkout"
import { cn } from "@/lib/utils"
import { useCart } from "../cart-context"
import { CompletionRing } from "./completion-ring"

export function ProfileDashboard() {
  const {
    profile,
    updateProfile,
    verificationStatus,
    submitVerification,
    savedAddress,
    setView,
    order,
  } = useCart()

  // Profile completion = weighted checklist.
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
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          My Account
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Profile
        </h1>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="flex flex-col gap-6">
          {/* Identity card */}
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
              </div>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {profile.email}
              </p>
              <p className="text-muted-foreground mt-0.5 inline-flex items-center gap-1 text-sm">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                {profile.location}
              </p>
            </div>
          </section>

          {/* Editable info cards */}
          <EditableField
            label="Display name"
            value={profile.name}
            onSave={(v) => updateProfile({ name: v })}
          />
          <EditableField
            label="Email address"
            value={profile.email}
            type="email"
            onSave={(v) => updateProfile({ email: v })}
          />
          <EditableField
            label="Location"
            value={profile.location}
            onSave={(v) => updateProfile({ location: v })}
          />
          <EditableField
            label="Bio"
            value={profile.bio}
            multiline
            onSave={(v) => updateProfile({ bio: v })}
          />

          {/* Professional verification */}
          <VerificationPanel
            status={verificationStatus}
            email={profile.email}
            onSubmit={submitVerification}
          />

          {/* Activity hub */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <h3 className="text-foreground text-sm font-semibold">Activity</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ActivityCard
                icon={Package}
                title="Order Tracking"
                description={
                  order ? `Latest: ${order.number}` : "No active orders yet"
                }
                action="Track order"
                onClick={() => setView("tracking")}
              />
            </div>
          </section>
        </div>

        {/* Sidebar — completion */}
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

// ---------------------------------------------------------------------------
// 3-state verification badge
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Inline-editable field card
// ---------------------------------------------------------------------------
function EditableField({
  label,
  value,
  onSave,
  type = "text",
  multiline,
}: {
  label: string
  value: string
  onSave: (v: string) => void
  type?: string
  multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function start() {
    setDraft(value)
    setEditing(true)
  }
  function save() {
    if (draft.trim()) onSave(draft.trim())
    setEditing(false)
  }

  return (
    <section className="border-border bg-card rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {label}
          </p>
          {!editing && (
            <p className="text-foreground mt-1.5 text-sm leading-relaxed text-pretty">
              {value || <span className="text-muted-foreground">Not set</span>}
            </p>
          )}
        </div>
        {!editing && (
          <button
            type="button"
            onClick={start}
            className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            Edit
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-3 flex flex-col gap-3">
          {multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              autoFocus
              className="border-border bg-background text-foreground focus:border-foreground w-full resize-none rounded-md border px-3 py-2 text-sm transition-colors outline-none"
            />
          ) : (
            <input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              className="border-border bg-background text-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
            />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              className="bg-foreground text-background inline-flex h-9 items-center rounded-md px-4 text-xs font-semibold transition-opacity hover:opacity-90"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border-border text-foreground hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Professional verification panel — document upload gated by status
// ---------------------------------------------------------------------------
function VerificationPanel({
  status,
  email,
  onSubmit,
}: {
  status: VerificationStatus
  email: string
  onSubmit: () => void
}) {
  // Store the file name for display and a revocable object URL for preview.
  const [fileName, setFileName] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const locked = status !== "regular"

  // Revoke the object URL when it is replaced or the component unmounts to
  // avoid memory leaks.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    // Revoke the previous URL before creating a new one.
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFileName(f.name)
    setPreviewUrl(URL.createObjectURL(f))
  }

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFileName(null)
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-foreground h-4 w-4" strokeWidth={2} />
        <h3 className="text-foreground text-sm font-semibold">
          Professional Verification
        </h3>
      </div>

      {status === "verified" ? (
        <div className="border-foreground/15 bg-muted mt-4 flex items-center gap-3 rounded-xl border px-4 py-3">
          <BadgeCheck className="text-foreground h-5 w-5" strokeWidth={2} />
          <p className="text-foreground text-sm">
            Your license is verified. Professional pricing and B2B ordering are
            unlocked.
          </p>
        </div>
      ) : status === "pending" ? (
        <div className="border-border bg-muted mt-4 flex items-start gap-3 rounded-xl border px-4 py-3">
          <Clock
            className="text-foreground mt-0.5 h-5 w-5 shrink-0"
            strokeWidth={2}
          />
          <div>
            <p className="text-foreground text-sm font-medium">
              Review in progress
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              We&apos;re reviewing your documents. We&apos;ll email{" "}
              <span className="text-foreground font-medium">{email}</span> as
              soon as your professional status is approved. Uploads are paused
              until then.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mt-3 text-sm">
            Upload your cosmetology or salon license to unlock professional
            pricing and restricted products.
          </p>

          {/* Doc upload — disabled once submitted */}
          <button
            type="button"
            disabled={locked}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "mt-4 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
              locked
                ? "border-border cursor-not-allowed opacity-50"
                : "border-border hover:border-foreground/40",
            )}
          >
            {previewUrl && previewUrl.startsWith("blob:") ? (
              <img
                src={previewUrl}
                alt="License preview"
                className="h-20 w-20 rounded-md object-cover"
              />
            ) : (
              <UploadCloud
                className="text-muted-foreground h-8 w-8"
                strokeWidth={1.5}
              />
            )}
            <span className="text-foreground mt-3 text-sm font-medium">
              {fileName ? fileName : "Click to upload license document"}
            </span>
            <span className="text-muted-foreground mt-1 text-xs">
              PDF, JPG or PNG · up to 10MB
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />

          {fileName && (
            <div className="border-border bg-muted mt-3 flex items-center justify-between rounded-lg border px-3 py-2.5">
              <span className="text-foreground flex min-w-0 items-center gap-2 text-sm">
                <FileText
                  className="text-muted-foreground h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                <span className="truncate">{fileName}</span>
              </span>
              <button
                type="button"
                onClick={clearFile}
                aria-label="Remove file"
                className="text-muted-foreground hover:bg-background hover:text-foreground flex h-7 w-7 items-center justify-center rounded-md transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={!fileName}
            onClick={onSubmit}
            className="bg-foreground text-background mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload className="h-4 w-4" strokeWidth={2} />
            Submit for verification
          </button>
        </>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Activity hub card
// ---------------------------------------------------------------------------
function ActivityCard({
  icon: Icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: typeof Package
  title: string
  description: string
  action: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border bg-background hover:bg-muted flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors"
    >
      <span className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
        <Icon className="text-foreground h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="text-foreground text-sm font-semibold">{title}</span>
      <span className="text-muted-foreground text-xs">{description}</span>
      <span className="text-foreground mt-1 text-xs font-medium underline underline-offset-2">
        {action}
      </span>
    </button>
  )
}
