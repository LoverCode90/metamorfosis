import type { Metadata } from "next"

import { KitsPage } from "@/components/marketing/kits-page"

export const metadata: Metadata = {
  title: "Professional Kits — Metamorfosis Beauty",
  description:
    "Exclusive color kits for professionals — Earthia, Color Tech, UHD, Tech Color 0, and developers with 30% off.",
}

export default function Kits() {
  return <KitsPage />
}
