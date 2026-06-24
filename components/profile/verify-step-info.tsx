"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import type { LicenseInfo } from "./verify-step-types"

export function InfoStep({
  info,
  onChange,
  licenseError,
  licenseHelperText,
}: {
  info: LicenseInfo
  onChange: (info: LicenseInfo) => void
  licenseError?: string | null
  licenseHelperText?: string
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Verify your professional license
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Professional-only formulas require a valid cosmetology or barbering
          license.
        </p>
      </div>
      <div className="border-border bg-background space-y-5 rounded-xl border p-6">
        <InfoField label="Business / Salon name">
          <input
            type="text"
            value={info.businessName}
            onChange={(e) =>
              onChange({ ...info, businessName: e.target.value })
            }
            placeholder="Metamorfosis Studio"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
          />
        </InfoField>
        <InfoField label="Profession" required>
          <select
            value={info.profession}
            onChange={(e) => onChange({ ...info, profession: e.target.value })}
            className="border-border bg-background text-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
          >
            <option>Cosmetologist</option>
            <option>Barber</option>
            <option>Colorist</option>
            <option>Salon Owner</option>
            <option>Esthetician</option>
          </select>
        </InfoField>
        <InfoField label="License number" required>
          <input
            type="text"
            value={info.licenseNumber}
            onChange={(e) =>
              onChange({ ...info, licenseNumber: e.target.value })
            }
            placeholder="e.g. C123456"
            className={cn(
              "border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none",
              licenseError && "border-rose-500 focus:border-rose-500",
            )}
          />
          {licenseHelperText && !licenseError && (
            <p className="text-muted-foreground mt-1 text-xs">
              {licenseHelperText}
            </p>
          )}
          {licenseError && (
            <p className="mt-1 text-xs text-rose-500">{licenseError}</p>
          )}
        </InfoField>
        <InfoField label="Country / Region">
          <select
            value={info.country}
            onChange={(e) => onChange({ ...info, country: e.target.value })}
            className="border-border bg-background text-foreground focus:border-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none"
          >
            <option value="United States">United States</option>
          </select>
        </InfoField>
      </div>
    </div>
  )
}

function InfoField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-foreground mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-muted-foreground ml-0.5">*</span>}
      </span>
      {children}
    </label>
  )
}
