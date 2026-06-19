import type {
  DbProfile,
  DbVerificationStatus,
  UserProfile,
  VerificationStatus,
} from "@/lib/types"

const DEFAULT_AVATAR = "/professional-hair-colorist-portrait.png"

export function mapVerificationStatus(
  status: DbVerificationStatus,
): VerificationStatus {
  switch (status) {
    case "approved":
      return "verified"
    case "pending_review":
      return "pending"
    case "rejected":
      return "rejected"
    default:
      return "regular"
  }
}

export function mapDbProfile(row: DbProfile): UserProfile {
  return {
    name: row.full_name,
    email: row.email,
    location: row.business_name ?? "",
    bio: row.bio ?? "",
    avatar: DEFAULT_AVATAR,
    status: mapVerificationStatus(row.verification_status),
  }
}
