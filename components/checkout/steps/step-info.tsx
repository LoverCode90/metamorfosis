"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FloatingField } from "@/components/checkout/floating-field"
import { US_STATES } from "@/lib/constants"
import type { CheckoutAddress } from "@/lib/checkout/types"

const schema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(10, "Phone number required")
    .regex(/^[\d\s\-\(\)\+]+$/, "Invalid phone number"),
  streetLine1: z.string().min(3, "Street address required"),
  streetLine2: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.string().length(2, "Select a state"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code"),
  termsAccepted: z.boolean().optional(),
})

type InfoFormValues = z.infer<typeof schema>

interface StepInfoProps {
  hasNonReturnable: boolean
  defaultValues?: Partial<InfoFormValues>
  onContinue: (data: CheckoutAddress, termsAccepted: boolean) => void
}

export function StepInfo({
  hasNonReturnable,
  defaultValues,
  onContinue,
}: StepInfoProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InfoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { state: "", ...defaultValues },
  })

  const termsAccepted = watch("termsAccepted")

  function onSubmit(values: InfoFormValues) {
    if (hasNonReturnable && !values.termsAccepted) return
    onContinue(
      {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        streetLine1: values.streetLine1,
        streetLine2: values.streetLine2 ?? "",
        city: values.city,
        state: values.state,
        zip: values.zip,
        country: "US",
      },
      !!values.termsAccepted,
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <h2 className="text-foreground text-lg font-semibold">
        Contact & Address
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <FloatingField
          label="Full name"
          error={errors.fullName?.message}
          required
        >
          <input
            {...register("fullName")}
            className="peer border-border bg-background text-foreground focus:border-foreground w-full rounded-md border px-3 pt-5 pb-2 text-sm placeholder-transparent transition-colors outline-none"
            placeholder="Full name"
          />
        </FloatingField>
        <FloatingField label="Phone" error={errors.phone?.message} required>
          <input
            {...register("phone")}
            type="tel"
            className="peer border-border bg-background text-foreground focus:border-foreground w-full rounded-md border px-3 pt-5 pb-2 text-sm placeholder-transparent transition-colors outline-none"
            placeholder="Phone"
          />
        </FloatingField>
      </div>

      <FloatingField label="Email" error={errors.email?.message} required>
        <input
          {...register("email")}
          type="email"
          className="peer border-border bg-background text-foreground focus:border-foreground w-full rounded-md border px-3 pt-5 pb-2 text-sm placeholder-transparent transition-colors outline-none"
          placeholder="Email"
        />
      </FloatingField>

      <FloatingField
        label="Street address"
        error={errors.streetLine1?.message}
        required
      >
        <input
          {...register("streetLine1")}
          className="peer border-border bg-background text-foreground focus:border-foreground w-full rounded-md border px-3 pt-5 pb-2 text-sm placeholder-transparent transition-colors outline-none"
          placeholder="Street address"
        />
      </FloatingField>

      <FloatingField
        label="Apartment, suite, unit (optional)"
        error={undefined}
      >
        <input
          {...register("streetLine2")}
          className="peer border-border bg-background text-foreground focus:border-foreground w-full rounded-md border px-3 pt-5 pb-2 text-sm placeholder-transparent transition-colors outline-none"
          placeholder="Apartment, suite, unit"
        />
      </FloatingField>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <FloatingField label="City" error={errors.city?.message} required>
            <input
              {...register("city")}
              className="peer border-border bg-background text-foreground focus:border-foreground w-full rounded-md border px-3 pt-5 pb-2 text-sm placeholder-transparent transition-colors outline-none"
              placeholder="City"
            />
          </FloatingField>
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            State <span className="text-destructive">*</span>
          </label>
          <select
            {...register("state")}
            className="border-border bg-background text-foreground focus:border-foreground w-full rounded-md border px-3 py-2.5 text-sm outline-none"
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-destructive mt-1 text-xs">
              {errors.state.message}
            </p>
          )}
        </div>
        <div>
          <FloatingField label="ZIP code" error={errors.zip?.message} required>
            <input
              {...register("zip")}
              className="peer border-border bg-background text-foreground focus:border-foreground w-full rounded-md border px-3 pt-5 pb-2 text-sm placeholder-transparent transition-colors outline-none"
              placeholder="ZIP"
            />
          </FloatingField>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        We only ship within the United States.
      </p>

      {hasNonReturnable && (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
          <input
            {...register("termsAccepted")}
            type="checkbox"
            className="accent-foreground mt-0.5 h-4 w-4 shrink-0"
          />
          <span className="text-foreground text-sm">
            I understand that{" "}
            <span className="font-medium">
              chemical products (bleach, developer, permanent color)
            </span>{" "}
            cannot be returned once shipped.
          </span>
        </label>
      )}

      <button
        type="submit"
        disabled={hasNonReturnable && !termsAccepted}
        className="bg-foreground text-background flex h-12 w-full items-center justify-center rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue to Shipping
      </button>
    </form>
  )
}
