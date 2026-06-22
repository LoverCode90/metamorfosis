"use client"

import { useEffect, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle, Pencil } from "lucide-react"
import { FloatingField } from "@/components/checkout/floating-field"
import { US_STATES } from "@/lib/constants"
import type { CheckoutAddress } from "@/lib/checkout/types"
import { PhoneInput } from "@/components/ui/phone-input"
import {
  digits as phoneDigits,
  formatPhone,
  phoneErrorMessage,
  validatePhone,
} from "@/lib/utils/phone"

const schema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Enter a valid email"),
  // PhoneInput stores raw 10-digit string; reject Hawaii/Alaska and partial input.
  phone: z.string().superRefine((v, ctx) => {
    const err = validatePhone(v)
    if (err !== null) {
      ctx.addIssue({ code: "custom", message: phoneErrorMessage(err) })
    }
  }),
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
  /** Initial values from the user's profile (name, email, phone) */
  defaultValues?: Partial<InfoFormValues>
  /** Whether the user is authenticated — determines if we fetch saved address */
  isAuthenticated: boolean
  onContinue: (data: CheckoutAddress, termsAccepted: boolean) => void
}

export function StepInfo({
  hasNonReturnable,
  defaultValues,
  isAuthenticated,
  onContinue,
}: StepInfoProps) {
  const [savedAddress, setSavedAddress] = useState<CheckoutAddress | null>(null)
  const [usingSaved, setUsingSaved] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(isAuthenticated)
  const fetchedRef = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<InfoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      state: "",
      ...defaultValues,
      // Normalize any pre-filled phone (formatted from profile/saved address)
      // to the raw 10-digit form the PhoneInput expects.
      phone: defaultValues?.phone ? phoneDigits(defaultValues.phone) : "",
    },
  })

  // Fetch saved default address once for authenticated users
  useEffect(() => {
    if (!isAuthenticated || fetchedRef.current) return
    fetchedRef.current = true

    fetch("/api/addresses/default")
      .then((r) => r.json())
      .then(({ address }: { address: CheckoutAddress | null }) => {
        if (address) {
          setSavedAddress(address)
          setUsingSaved(true)
          // Pre-fill the form with all saved fields
          reset({
            fullName: address.fullName,
            email: address.email,
            phone: phoneDigits(address.phone),
            streetLine1: address.streetLine1,
            streetLine2: address.streetLine2,
            city: address.city,
            state: address.state,
            zip: address.zip,
          })
        }
        setLoadingAddress(false)
      })
      .catch(() => setLoadingAddress(false))
  }, [isAuthenticated, reset])

  const termsAccepted = useWatch({ control, name: "termsAccepted" })

  function onSubmit(values: InfoFormValues) {
    if (hasNonReturnable && !values.termsAccepted) return
    onContinue(
      {
        fullName: values.fullName,
        email: values.email,
        // Send the human-formatted form downstream; Shippo accepts US national.
        phone: formatPhone(values.phone),
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

  if (loadingAddress) {
    return (
      <div className="space-y-6">
        <h2 className="text-foreground text-lg font-semibold">
          Contact & Address
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted h-12 animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <h2 className="text-foreground text-lg font-semibold">
        Contact & Address
      </h2>

      {/* Saved address banner */}
      {savedAddress && usingSaved && (
        <div className="border-border bg-muted/40 flex items-start justify-between gap-3 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <CheckCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
              strokeWidth={1.75}
            />
            <div>
              <p className="text-foreground text-sm font-medium">
                Using saved address
              </p>
              <p className="text-muted-foreground text-xs">
                {savedAddress.streetLine1}
                {savedAddress.streetLine2
                  ? `, ${savedAddress.streetLine2}`
                  : ""}
                {" — "}
                {savedAddress.city}, {savedAddress.state} {savedAddress.zip}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUsingSaved(false)}
            className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <Pencil className="h-3 w-3" strokeWidth={2} />
            Edit
          </button>
        </div>
      )}

      {/* Form fields — always rendered so react-hook-form state is maintained */}
      <div
        className={
          savedAddress && usingSaved ? "pointer-events-none opacity-50" : ""
        }
      >
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
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              Phone <span className="text-destructive">*</span>
            </label>
            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <PhoneInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  showError={fieldState.isTouched || Boolean(errors.phone)}
                />
              )}
            />
          </div>
        </div>

        <div className="mt-4">
          <FloatingField label="Email" error={errors.email?.message} required>
            <input
              {...register("email")}
              type="email"
              className="peer border-border bg-background text-foreground focus:border-foreground w-full rounded-md border px-3 pt-5 pb-2 text-sm placeholder-transparent transition-colors outline-none"
              placeholder="Email"
            />
          </FloatingField>
        </div>

        <div className="mt-4">
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
        </div>

        <div className="mt-4">
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
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
            <FloatingField
              label="ZIP code"
              error={errors.zip?.message}
              required
            >
              <input
                {...register("zip")}
                className="peer border-border bg-background text-foreground focus:border-foreground w-full rounded-md border px-3 pt-5 pb-2 text-sm placeholder-transparent transition-colors outline-none"
                placeholder="ZIP"
              />
            </FloatingField>
          </div>
        </div>

        {/* Country — locked to the US (continental only). Read-only, clearly
            shown as fixed rather than a broken/disabled control. */}
        <div className="mt-4">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Country
          </label>
          <div className="border-border bg-muted/40 text-muted-foreground flex h-11 w-full items-center justify-between rounded-md border px-3 text-sm">
            <span className="text-foreground">United States</span>
            <span className="text-xs">Ships within continental US only</span>
          </div>
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
