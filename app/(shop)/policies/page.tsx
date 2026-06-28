import { PoliciesContent } from "@/components/marketing/policies-content"
import { HomeFooter } from "@/components/marketing/home-footer"

export const metadata = {
  title: "Policies & Privacy — Metamorfosis LLC",
  description:
    "Terms of service, return policy, and privacy policy for Metamorfosis LLC.",
}

export default function PoliciesPage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <PoliciesContent />
      </main>
      <HomeFooter />
    </>
  )
}
