"use client"

import { useRef, useState } from "react"
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  FileText,
  GraduationCap,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
  Upload,
  UploadCloud,
  X,
} from "lucide-react"
import type { UserProfile, VerificationStatus } from "@/lib/checkout"
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
    { id: "name", label: "Add your name", done: profile.name.trim().length > 0 },
    { id: "location", label: "Set your location", done: profile.location.trim().length > 0 },
    { id: "bio", label: "Write a short bio", done: profile.bio.trim().length >= 20 },
    { id: "address", label: "Save a shipping address", done: Boolean(savedAddress) },
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
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          My Account
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Profile
        </h1>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="flex flex-col gap-6">
          {/* Identity card */}
          <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
            <img
              src={profile.avatar || "/placeholder.svg"}
              alt={profile.name}
              className="h-20 w-20 shrink-0 rounded-full border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{profile.name}</h2>
                <VerificationBadge status={verificationStatus} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{profile.email}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
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
          <section className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">Activity</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ActivityCard
                icon={Package}
                title="Order Tracking"
                description={
                  order
                    ? `Latest: ${order.number}`
                    : "No active orders yet"
                }
                action="Track order"
                onClick={() => setView("tracking")}
              />
              <ActivityCard
                icon={GraduationCap}
                title="Academy"
                description="Masterclasses & certification paths"
                action="Explore Academy"
                onClick={() => setView("academy")}
              />
            </div>
          </section>

          {/* Academy course history — empty state */}
          <AcademyEmptyState onExplore={() => setView("academy")} />
        </div>

        {/* Sidebar — completion */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground">
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
                      c.done ? "text-muted-foreground line-through" : "text-foreground",
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
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {!editing && (
            <p className="mt-1.5 text-sm leading-relaxed text-foreground text-pretty">
              {value || <span className="text-muted-foreground">Not set</span>}
            </p>
          )}
        </div>
        {!editing && (
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
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
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            />
          ) : (
            <input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              className="inline-flex h-9 items-center rounded-md bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-90"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
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
  const [file, setFile] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const locked = status !== "regular"

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-foreground" strokeWidth={2} />
        <h3 className="text-sm font-semibold text-foreground">
          Professional Verification
        </h3>
      </div>

      {status === "verified" ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-foreground/15 bg-muted px-4 py-3">
          <BadgeCheck className="h-5 w-5 text-foreground" strokeWidth={2} />
          <p className="text-sm text-foreground">
            Your license is verified. Professional pricing and B2B ordering are
            unlocked.
          </p>
        </div>
      ) : status === "pending" ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-foreground" strokeWidth={2} />
          <div>
            <p className="text-sm font-medium text-foreground">Review in progress</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              We&apos;re reviewing your documents. We&apos;ll email{" "}
              <span className="font-medium text-foreground">{email}</span> as soon as
              your professional status is approved. Uploads are paused until then.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted-foreground">
            Upload your cosmetology or salon license to unlock professional pricing
            and restricted products.
          </p>

          {/* Doc upload — disabled once submitted */}
          <button
            type="button"
            disabled={locked}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "mt-4 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
              locked
                ? "cursor-not-allowed border-border opacity-50"
                : "border-border hover:border-foreground/40",
            )}
          >
            <UploadCloud className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            <span className="mt-3 text-sm font-medium text-foreground">
              {file ? file : "Click to upload license document"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PDF, JPG or PNG · up to 10MB
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setFile(f.name)
            }}
          />

          {file && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2.5">
              <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="truncate">{file}</span>
              </span>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove file"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={!file}
            onClick={onSubmit}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
// Academy course history — empty state
// ---------------------------------------------------------------------------
function AcademyEmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground">Academy Courses</h3>
      <div className="mt-6 flex flex-col items-center gap-4 py-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
          <GraduationCap className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
        </span>
        <div>
          <p className="text-base font-semibold text-foreground">
            No tienes cursos activos
          </p>
          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Aún no has adquirido ningún masterclass. Explora nuestros programas
            presenciales y da el siguiente paso en tu carrera.
          </p>
        </div>
        <button
          type="button"
          onClick={onExplore}
          className="mt-1 inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          Explorar Cursos
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
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
      className="flex flex-col items-start gap-2 rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-foreground" strokeWidth={1.75} />
      </span>
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
      <span className="mt-1 text-xs font-medium text-foreground underline underline-offset-2">
        {action}
      </span>
    </button>
  )
}
