import { requireAdmin } from "@/lib/auth/helpers"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"
import { PickupScheduleView } from "@/components/admin/shipping/pickup-schedule-view"
import { createAdminClient } from "@/lib/supabase/admin"
import { loadPickupScheduleData } from "@/lib/admin/load-pickup-schedule-data"

export const metadata = {
  title: "Schedule pickups — Admin — Metamorfosis Beauty",
}

export default async function AdminSchedulePickupsPage() {
  await requireAdmin()
  const admin = createAdminClient()
  const initialData = await loadPickupScheduleData(admin)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Schedule pickups"
        description="Request USPS or DHL Express to pick up labeled packages at the Ontario store."
      />
      <PickupScheduleView initialData={initialData} />
    </div>
  )
}
