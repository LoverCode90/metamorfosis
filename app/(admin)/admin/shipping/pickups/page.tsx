import { requireAdmin } from "@/lib/auth/helpers"
import { PickupSchedulePage } from "@/components/admin/shipping/pickup-schedule-page"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchPickupTabData } from "@/lib/admin/fetch-pickup-orders"
import type { PickupTabResponse } from "@/lib/admin/carrier-pickup-types"

export const metadata = {
  title: "Schedule Pickup — Admin — Metamorfosis Beauty",
}

export default async function AdminSchedulePickupsPage() {
  await requireAdmin()
  const admin = createAdminClient()
  const initialTabData = (await fetchPickupTabData(
    admin,
    "ready",
    0,
    10,
  )) as PickupTabResponse

  return <PickupSchedulePage initialTabData={initialTabData} />
}
