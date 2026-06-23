import type { DbProfile, UserProfile } from "@/lib/types"
import { EditableField } from "./editable-field"

interface ProfileInfoSectionProps {
  profile: UserProfile
  updateProfile: (
    patch: Partial<
      Pick<DbProfile, "first_name" | "last_name" | "business_name">
    >,
  ) => Promise<void>
}

export function ProfileInfoSection({
  profile,
  updateProfile,
}: ProfileInfoSectionProps) {
  return (
    <>
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
    </>
  )
}
