"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SettingsField } from "@/components/admin/settings/settings-field"
import { useProfileNameForm } from "@/hooks/use-profile-name-form"

interface AdminProfileFormProps {
  initialFirstName: string
  initialLastName: string
  email: string
  onSave: (firstName: string, lastName: string) => Promise<void>
}

/** Editable first/last-name form with a read-only email and save feedback. */
export function AdminProfileForm({
  initialFirstName,
  initialLastName,
  email,
  onSave,
}: AdminProfileFormProps) {
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    saving,
    saved,
    canSave,
    save,
  } = useProfileNameForm({ initialFirstName, initialLastName, onSave })

  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="First name">
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            className="h-11"
          />
        </SettingsField>
        <SettingsField label="Last name">
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            className="h-11"
          />
        </SettingsField>
      </div>
      <SettingsField label="Email address">
        <Input
          value={email}
          readOnly
          type="email"
          className="bg-muted text-muted-foreground h-11 cursor-not-allowed"
        />
      </SettingsField>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={!canSave || saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </Button>
        {saved && <span className="text-sm text-emerald-500">Saved</span>}
      </div>
    </div>
  )
}
