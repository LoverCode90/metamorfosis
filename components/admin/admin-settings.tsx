"use client"

import { Loader2, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { AdminAppearance } from "@/components/admin/settings/admin-appearance"
import { AdminProfileForm } from "@/components/admin/settings/admin-profile-form"
import { useUser } from "@/hooks/use-user"

/**
 * Admin settings page: editable profile name, admin-only appearance
 * preferences, and sign out. Data comes from {@link useUser}; the editable
 * form state lives in {@link AdminProfileForm}.
 */
export function AdminSettings() {
  const { profile, dbProfile, updateProfile, isLoading } = useUser()

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

      <section className="border-border bg-card rounded-2xl border p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-foreground text-sm font-semibold">Profile</h2>
          <Badge variant="violet">
            <ShieldCheck className="h-3 w-3" strokeWidth={2} />
            Admin
          </Badge>
        </div>

        {isLoading ? (
          <div className="mt-5 flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          // Re-mounts (fresh state) whenever the loaded/saved name changes.
          <AdminProfileForm
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

      <AdminAppearance />

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
