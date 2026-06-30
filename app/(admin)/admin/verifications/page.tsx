import { VerificationsDashboard } from "@/components/admin/verifications-list"

export const metadata = {
  title: "Verifications — Admin · Metamorfosis Beauty",
}

export default function VerificationsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Professional Verifications
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review submitted license documents. Approved users unlock professional
          pricing and restricted products.
        </p>
      </div>

      <div className="min-h-0 flex-1">
        <VerificationsDashboard />
      </div>
    </div>
  )
}
