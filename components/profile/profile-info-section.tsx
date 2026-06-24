"use client"

import type { DbProfile, UserProfile } from "@/lib/types"
import { digits as phoneDigits, formatPhone } from "@/lib/utils/phone"
import { EditableField } from "./editable-field"

interface ProfileInfoSectionProps {
  profile: UserProfile
  /** Raw phone digits from `profiles.phone_number` (may be empty). */
  phone: string
  updateProfile: (
    patch: Partial<
      Pick<
        DbProfile,
        "first_name" | "last_name" | "business_name" | "phone_number"
      >
    >,
  ) => Promise<void>
}

export function ProfileInfoSection({
  profile,
  phone,
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
        label="Phone number"
        type="tel"
        value={phone ? formatPhone(phone) : ""}
        onSave={(v) => updateProfile({ phone_number: phoneDigits(v) })}
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
