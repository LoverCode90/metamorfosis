import type React from "react"
import {
  BadgeCheck,
  GraduationCap,
  Home,
  ShieldCheck,
  Star,
  User,
} from "lucide-react"
import type { UserRole, VerificationStatus } from "@/lib/types"
import { PRO_RESTRICTIONS_ENABLED } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function ProfileBadges({
  role,
  verificationStatus,
}: {
  role: UserRole
  verificationStatus: VerificationStatus
}) {
  if (role === "admin") {
    return (
      <Chip
        label="Admin"
        icon={ShieldCheck}
        className="border-accent-violet bg-accent-violet text-white"
      />
    )
  }

  const isPro =
    PRO_RESTRICTIONS_ENABLED &&
    (role === "professional" || role === "student" || role === "salon_owner")

  if (isPro && verificationStatus === "verified") {
    const roleConfig: Record<
      "professional" | "student" | "salon_owner",
      { label: string; icon: React.ElementType }
    > = {
      professional: { label: "Professional", icon: Star },
      student: { label: "Student", icon: GraduationCap },
      salon_owner: { label: "Salon Owner", icon: Home },
    }
    const { label, icon } =
      roleConfig[role as "professional" | "student" | "salon_owner"]
    return (
      <>
        <Chip
          label={label}
          icon={icon}
          className="border-accent-amber/40 bg-accent-amber/10 text-accent-amber"
        />
        <Chip
          label="Verified"
          icon={BadgeCheck}
          className="border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald"
        />
      </>
    )
  }

  return (
    <Chip
      label="Standard"
      icon={User}
      className="border-border text-muted-foreground"
    />
  )
}

function Chip({
  label,
  icon: Icon,
  className,
}: {
  label: string
  icon: React.ElementType
  className: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        className,
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {label}
    </span>
  )
}
