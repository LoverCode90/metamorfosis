import {
  CreditCard,
  Lock,
  MapPin,
  Package,
  ShieldCheck,
  User,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { PRO_RESTRICTIONS_ENABLED } from "@/lib/constants"

interface NavVisibilityContext {
  isAdmin: boolean
  isGoogleUser: boolean
}

export interface ProfileNavRowDef {
  href: string
  icon: LucideIcon
  title: string
  description: string
  isVisible?: (ctx: NavVisibilityContext) => boolean
}

export const PROFILE_NAV_ROWS: ProfileNavRowDef[] = [
  {
    href: "/profile/personal",
    icon: User,
    title: "Personal Info",
    description: "Name, phone, email",
  },
  {
    href: "/profile/addresses",
    icon: MapPin,
    title: "Shipping Info",
    description: "Name, phone & shipping address",
  },
  {
    href: "/profile/cards",
    icon: CreditCard,
    title: "Payment Methods",
    description: "Saved cards",
  },
  {
    href: "/profile/security",
    icon: Lock,
    title: "Security",
    description: "Change your password",
    isVisible: ({ isGoogleUser }) => !isGoogleUser,
  },
  {
    href: "/orders",
    icon: Package,
    title: "Orders",
    description: "Your order history",
  },
  {
    href: "/profile/verification",
    icon: ShieldCheck,
    title: "Professional Verification",
    description: "License status",
    isVisible: ({ isAdmin }) => !isAdmin && PRO_RESTRICTIONS_ENABLED,
  },
]

/** Profile-completion percentage from the relevant checklist items. */
export function computeCompletionPercent(args: {
  hasName: boolean
  hasAddress: boolean
  isAdmin: boolean
  isVerified: boolean
}): number {
  const checklist = [
    args.hasName,
    args.hasAddress,
    ...(!args.isAdmin && PRO_RESTRICTIONS_ENABLED ? [args.isVerified] : []),
  ]
  return Math.round((checklist.filter(Boolean).length / checklist.length) * 100)
}
