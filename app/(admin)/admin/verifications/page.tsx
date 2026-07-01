import { VerificationsDashboard } from "@/components/admin/verifications-list"
import { VerificationsHelpCard } from "@/components/admin/help/verifications-help-card"
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header"

export const metadata = {
  title: "Verifications — Admin · Metamorfosis Beauty",
}

export default function VerificationsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <AdminPageHeader
        title="Professional licenses"
        description="Review license photos from stylists and students."
      />

      <VerificationsHelpCard />

      <div className="min-h-0 flex-1">
        <VerificationsDashboard />
      </div>
    </div>
  )
}
