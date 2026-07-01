"use client"

import { Loader2, Palette, RefreshCw, ShieldCheck, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { AdminAppearance } from "@/components/admin/settings/admin-appearance"
import { AdminProfileForm } from "@/components/admin/settings/admin-profile-form"
import {
  AdminBentoGrid,
  AdminPageHeader,
} from "@/components/admin/ui/admin-page-header"
import { AdminSurfaceCard } from "@/components/admin/ui/admin-surface-card"
import { useUser } from "@/hooks/use-user"
import { SyncCatalogButton } from "@/components/admin/settings/sync-catalog-button"

/** Admin settings in a responsive bento grid with premium cards. */
export function AdminSettings() {
  const { profile, dbProfile, updateProfile, isLoading } = useUser()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        description="Manage your admin account, appearance preferences, and catalog tools."
      />

      <AdminBentoGrid>
        <AdminSurfaceCard
          className="md:col-span-2 xl:col-span-2"
          title="Profile"
          description="Your admin display name on this dashboard."
          icon={User}
          headerAction={
            <Badge variant="violet" className="shrink-0">
              <ShieldCheck className="h-3 w-3" strokeWidth={2} />
              Admin
            </Badge>
          }
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
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
        </AdminSurfaceCard>

        <AdminSurfaceCard
          title="Appearance"
          description="Make text larger or switch light/dark mode for easier reading."
          icon={Palette}
        >
          <AdminAppearance embedded />
        </AdminSurfaceCard>

        <AdminSurfaceCard
          title="Products"
          description="Refresh the website catalog from Square when needed."
          icon={RefreshCw}
        >
          <SyncCatalogButton />
        </AdminSurfaceCard>

        <AdminSurfaceCard
          className="md:col-span-2"
          title="Account"
          description="Sign out of the admin dashboard."
          icon={ShieldCheck}
        >
          <SignOutButton className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 w-full sm:w-auto" />
        </AdminSurfaceCard>
      </AdminBentoGrid>
    </div>
  )
}
