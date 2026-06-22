import { requireAdmin } from "@/lib/auth/helpers"
import { AdminSettings } from "@/components/admin/admin-settings"

export const metadata = { title: "Settings — Admin — Metamorfosis Beauty" }

export default async function AdminSettingsPage() {
  await requireAdmin()
  return <AdminSettings />
}
