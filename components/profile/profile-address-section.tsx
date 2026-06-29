"use client"

import type { User } from "@supabase/supabase-js"
import { Pencil } from "lucide-react"
import type { SavedAddress } from "@/lib/types"
import { DeleteAddressDialog } from "./delete-address-dialog"
import { ProfileAddressForm } from "./profile-address-form"
import { ProfileAddressDisplay } from "./profile-address-display"
import { useProfileAddress } from "@/hooks/use-profile-address"

interface ProfileAddressSectionProps {
  savedAddress: SavedAddress | null
  saveAddress: (address: SavedAddress) => void
  user: User | null
  email: string
  fromCheckout?: boolean
  step?: string | null
}

export function ProfileAddressSection({
  savedAddress,
  saveAddress,
  user,
  email,
  fromCheckout,
  step,
}: ProfileAddressSectionProps) {
  const {
    editing,
    draft,
    setDraft,
    fieldErrors,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting,
    suggestions,
    handlePlaceSelect,
    handleEditStart,
    handleCancel,
    handleSave,
    handleDelete,
  } = useProfileAddress({ savedAddress, saveAddress, user, email })

  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">Saved Address</h3>
        {!editing && (
          <button
            type="button"
            onClick={handleEditStart}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            {savedAddress ? "Edit" : "Add address"}
          </button>
        )}
      </div>

      {!editing ? (
        savedAddress ? (
          <ProfileAddressDisplay
            savedAddress={savedAddress}
            fromCheckout={fromCheckout}
            step={step}
            onDeleteClick={() => setShowDeleteConfirm(true)}
          />
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            No address saved yet.
          </p>
        )
      ) : (
        <ProfileAddressForm
          addrDraft={draft}
          setAddrDraft={setDraft}
          fieldErrors={fieldErrors}
          suggestions={suggestions}
          onPlaceSelect={handlePlaceSelect}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <DeleteAddressDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </section>
  )
}
