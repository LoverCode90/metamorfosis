"use client"

import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form"

import { FloatingInput } from "@/components/checkout/floating-input"
import { LabeledField } from "@/components/checkout/labeled-field"
import { StreetAutocompleteField } from "@/components/checkout/steps/street-autocomplete-field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { PhoneInput } from "@/components/ui/phone-input"
import { CONTINENTAL_STATES } from "@/lib/constants"
import type { ParsedAddress } from "@/lib/checkout/parse-place"
import type { InfoFormValues } from "@/lib/validation/checkout"

interface AddressFormFieldsProps {
  register: UseFormRegister<InfoFormValues>
  control: Control<InfoFormValues>
  errors: FieldErrors<InfoFormValues>
  setValue: UseFormSetValue<InfoFormValues>
  /** Dim and disable interaction when a saved address is in use. */
  disabled: boolean
}

/**
 * The contact + shipping-address inputs for step-info. Always rendered (so
 * react-hook-form state persists) and dimmed via `disabled` when a saved
 * address is active.
 */
export function AddressFormFields({
  register,
  control,
  errors,
  setValue,
  disabled,
}: AddressFormFieldsProps) {
  const streetValue = useWatch({ control, name: "streetLine1" }) || ""

  function handlePlaceParsed(parsed: ParsedAddress) {
    setValue("streetLine1", parsed.streetLine1)
    setValue("city", parsed.city)
    setValue("state", parsed.state)
    setValue("zip", parsed.zip)
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-50" : ""}>
      <div className="grid gap-4 sm:grid-cols-2">
        <LabeledField
          label="Full name"
          required
          error={errors.fullName?.message}
        >
          <Input
            autoComplete="name"
            placeholder="Full name"
            className="h-11"
            {...register("fullName")}
          />
        </LabeledField>
        <LabeledField label="Phone" required>
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
        </LabeledField>
      </div>

      <div className="mt-4">
        <FloatingInput
          label="Email"
          type="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="mt-4">
        <StreetAutocompleteField
          value={streetValue}
          error={errors.streetLine1?.message}
          register={register}
          onPlaceParsed={handlePlaceParsed}
        />
      </div>

      <div className="mt-4">
        <FloatingInput
          label="Apartment, suite, unit (optional)"
          {...register("streetLine2")}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <FloatingInput
          label="City"
          required
          error={errors.city?.message}
          {...register("city")}
        />
        <LabeledField label="State" required error={errors.state?.message}>
          <NativeSelect {...register("state")}>
            <option value="">Select state</option>
            {CONTINENTAL_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </NativeSelect>
        </LabeledField>
        <FloatingInput
          label="ZIP code"
          required
          error={errors.zip?.message}
          {...register("zip")}
        />
      </div>

      <div className="mt-4">
        <LabeledField label="Country">
          <div className="border-border bg-muted/40 text-muted-foreground flex h-11 w-full items-center justify-between rounded-md border px-3 text-sm">
            <span className="text-foreground">United States</span>
            <span className="text-xs">Ships within continental US only</span>
          </div>
        </LabeledField>
      </div>
    </div>
  )
}
