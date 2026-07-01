import { AdminHelpCard } from "@/components/admin/ui/admin-help-card"

export function CasesHelpCard() {
  return (
    <AdminHelpCard
      title="How to handle a support case"
      steps={[
        <>
          Open a case that says <strong>Needs your review</strong>.
        </>,
        <>
          Read what the customer reported and look at any photos they uploaded.
        </>,
        <>
          Choose <strong>Approve</strong> if you are honoring the request,{" "}
          <strong>Reject</strong> if not, or <strong>Ask for more info</strong>{" "}
          if you need something from them.
        </>,
      ]}
      note="The customer receives an email when you take action."
    />
  )
}
