"use client"

import { useState } from "react"
import { Loader2, Moon, ShieldCheck, Sun, Type } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { Slider } from "@/components/ui/slider"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { cn } from "@/lib/utils"
import {
  FONT_SIZE_LABELS,
  FONT_SIZE_ORDER,
  useAdminPrefs,
  type AdminFontSize,
} from "./admin-shell"

export function AdminSettings() {
  const { profile, dbProfile, updateProfile, isLoading } = useUser()
  const { theme, setTheme, fontSize, setFontSize } = useAdminPrefs()

  const fontIndex = FONT_SIZE_ORDER.indexOf(fontSize)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your admin account and display preferences.
        </p>
      </div>

      {/* ── Profile ── */}
      <section className="border-border bg-card rounded-2xl border p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-foreground text-sm font-semibold">Profile</h2>
          <span className="border-accent-violet bg-accent-violet inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold text-white">
            <ShieldCheck className="h-3 w-3" strokeWidth={2} />
            Admin
          </span>
        </div>

        {isLoading ? (
          <div className="mt-5 flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          // Re-mounts (fresh state) whenever the loaded/saved name changes.
          <ProfileForm
            key={`${profile.firstName}|${profile.lastName}`}
            initialFirstName={profile.firstName}
            initialLastName={profile.lastName}
            email={profile.email}
            onSave={(first, last) =>
              updateProfile({ first_name: first, last_name: last })
            }
          />
        )}
        {dbProfile?.role && dbProfile.role !== "admin" && (
          <p className="text-destructive mt-3 text-xs">
            Warning: this account is no longer an admin.
          </p>
        )}
      </section>

      {/* ── Appearance (admin only) ── */}
      <section className="border-border bg-card rounded-2xl border p-6">
        <h2 className="text-foreground text-sm font-semibold">Appearance</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          These preferences only affect the admin section. The store always uses
          the dark theme.
        </p>

        {/* Theme toggle */}
        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-foreground text-sm font-medium">Theme</p>
            <p className="text-muted-foreground text-xs">
              Choose how the admin section looks.
            </p>
          </div>
          <div className="border-border bg-background inline-flex rounded-lg border p-1">
            <ThemeOption
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
              icon={<Moon className="h-4 w-4" strokeWidth={1.75} />}
              label="Dark"
            />
            <ThemeOption
              active={theme === "light"}
              onClick={() => setTheme("light")}
              icon={<Sun className="h-4 w-4" strokeWidth={1.75} />}
              label="Light"
            />
          </div>
        </div>

        {/* Font size slider */}
        <div className="border-border mt-6 border-t pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-foreground flex items-center gap-1.5 text-sm font-medium">
                <Type className="h-4 w-4" strokeWidth={1.75} />
                Text size
              </p>
              <p className="text-muted-foreground text-xs">
                Adjust the base font size for the admin section.
              </p>
            </div>
            <span className="text-foreground text-sm font-semibold">
              {FONT_SIZE_LABELS[fontSize]}
            </span>
          </div>

          <div className="mt-4">
            <Slider
              min={0}
              max={2}
              step={1}
              value={[fontIndex]}
              onValueChange={(v) => {
                const idx = Array.isArray(v) ? (v[0] ?? 0) : v
                setFontSize((FONT_SIZE_ORDER[idx] ?? "normal") as AdminFontSize)
              }}
              aria-label="Admin text size"
            />
            <div className="text-muted-foreground mt-2 flex justify-between text-xs">
              {FONT_SIZE_ORDER.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFontSize(f)}
                  className={cn(
                    "transition-colors",
                    f === fontSize
                      ? "text-foreground font-semibold"
                      : "hover:text-foreground",
                  )}
                >
                  {FONT_SIZE_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sign out ── */}
      <section className="border-border bg-card rounded-2xl border p-6">
        <h2 className="text-foreground text-sm font-semibold">Account</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Sign out of the admin dashboard.
        </p>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </section>
    </div>
  )
}

function ProfileForm({
  initialFirstName,
  initialLastName,
  email,
  onSave,
}: {
  initialFirstName: string
  initialLastName: string
  email: string
  onSave: (firstName: string, lastName: string) => Promise<void>
}) {
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const dirty =
    firstName.trim() !== initialFirstName || lastName.trim() !== initialLastName
  const canSave =
    dirty && firstName.trim().length > 0 && lastName.trim().length > 0

  async function save() {
    if (!canSave) return
    setSaving(true)
    setSaved(false)
    await onSave(firstName.trim(), lastName.trim())
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            className="border-border bg-background text-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
          />
        </Field>
        <Field label="Last name">
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            className="border-border bg-background text-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
          />
        </Field>
      </div>
      <Field label="Email address">
        <input
          value={email}
          readOnly
          type="email"
          className="border-border bg-muted text-muted-foreground h-11 w-full cursor-not-allowed rounded-md border px-3 text-sm outline-none"
        />
      </Field>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!canSave || saving}
          className="bg-foreground text-background inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </button>
        {saved && <span className="text-sm text-emerald-500">Saved</span>}
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </label>
      {children}
    </div>
  )
}

function ThemeOption({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
