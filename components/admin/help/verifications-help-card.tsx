import { AdminHelpCard } from "@/components/admin/ui/admin-help-card"

export function VerificationsHelpCard() {
  return (
    <AdminHelpCard
      title="How to review a professional license"
      steps={[
        <>Select a person from the list on the left.</>,
        <>
          Open their uploaded license or student ID and check that it looks
          valid.
        </>,
        <>
          Tap <strong>Approve</strong> to unlock professional products and $2
          off each color line, or <strong>Reject</strong> if the document is not
          acceptable.
        </>,
      ]}
      note="Only approve licensed stylists, barbers, estheticians, or enrolled students."
    />
  )
}
