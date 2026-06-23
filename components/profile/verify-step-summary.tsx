"use client"

import { ShieldCheck } from "lucide-react"
import type { LicenseInfo, UploadedFile } from "./verify-step-types"

export function SummaryStep({
  info,
  file,
}: {
  info: LicenseInfo
  file: UploadedFile | null
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="bg-foreground text-background mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <ShieldCheck className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Review and confirm
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Confirm the details below to unlock professional products and continue
          to checkout.
        </p>
      </div>
      <dl className="divide-border border-border bg-background divide-y rounded-xl border">
        {[
          { label: "Business / Salon", value: info.businessName || "—" },
          { label: "License number", value: info.licenseNumber || "—" },
          { label: "Profession", value: info.profession },
          { label: "Country / Region", value: info.country },
          { label: "Document", value: file?.name ?? "Not attached" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="text-foreground truncate text-right text-sm font-medium">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-muted-foreground mt-5 text-center text-xs">
        By confirming, you certify that the information provided is accurate and
        that you hold a valid professional license.
      </p>
    </div>
  )
}
