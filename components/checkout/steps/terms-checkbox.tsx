"use client"

import { Controller, type Control } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import type { InfoFormValues } from "@/lib/validation/checkout"

export function TermsCheckbox({
  control,
}: {
  control: Control<InfoFormValues>
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
      <Controller
        control={control}
        name="termsAccepted"
        render={({ field }) => (
          <Checkbox
            checked={!!field.value}
            onCheckedChange={field.onChange}
            className="mt-0.5"
          />
        )}
      />
      <span className="text-foreground text-sm">
        I understand that{" "}
        <span className="font-medium">
          chemical products (bleach, developer, permanent color)
        </span>{" "}
        cannot be returned once shipped.
      </span>
    </label>
  )
}
