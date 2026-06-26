"use client"

import { useCallback, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { AddressFormFields } from "@/components/checkout/steps/address-form-fields"
import { SavedAddressBanner } from "@/components/checkout/steps/saved-address-banner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useSavedAddress } from "@/hooks/use-saved-address"
import {
  addressToInfoValues,
  buildInfoDefaults,
  infoValuesToAddress,
} from "@/lib/checkout/info-form"
import type { CheckoutAddress } from "@/lib/checkout/types"
import { infoSchema, type InfoFormValues } from "@/lib/validation/checkout"

interface StepInfoProps {
  hasNonReturnable: boolean
  /** Initial values from the user's profile or a prior step-info submission. */
  defaultValues?: Partial<InfoFormValues>
  isAuthenticated: boolean
  /** Skip auto-fetch of saved address (e.g. returning from the shipping step). */
  skipAddressFetch?: boolean
  onContinue: (data: CheckoutAddress, termsAccepted: boolean) => void
}

/**
 * Checkout step 1: collects contact details + US shipping address, pre-filling
 * from the user's saved default address and gating on the non-returnable ack.
 */
export function StepInfo({
  hasNonReturnable,
  defaultValues,
  isAuthenticated,
  skipAddressFetch = false,
  onContinue,
}: StepInfoProps) {
  const [usingSaved, setUsingSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: buildInfoDefaults(defaultValues),
  })

  const handleSavedLoaded = useCallback(
    (address: CheckoutAddress) => {
      setUsingSaved(true)
      reset(addressToInfoValues(address))
    },
    [reset],
  )

  const { savedAddress, isLoading } = useSavedAddress({
    isAuthenticated,
    enabled: !skipAddressFetch && !defaultValues?.streetLine1,
    onLoaded: handleSavedLoaded,
  })

  const termsAccepted = useWatch({ control, name: "termsAccepted" })

  function onSubmit(values: InfoFormValues) {
    if (hasNonReturnable && !values.termsAccepted) return
    onContinue(infoValuesToAddress(values), !!values.termsAccepted)
  }

  const heading = (
    <h2 className="text-foreground text-lg font-semibold">Contact & Address</h2>
  )
  if (isLoading) {
    return (
      <div className="space-y-6">
        {heading}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, skeletonIndex) => (
            <Skeleton key={skeletonIndex} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {heading}

      {savedAddress && usingSaved && (
        <SavedAddressBanner
          address={savedAddress}
          onEdit={() => setUsingSaved(false)}
        />
      )}

      <AddressFormFields
        register={register}
        control={control}
        errors={errors}
        setValue={setValue}
        disabled={!!savedAddress && usingSaved}
      />

      <p className="text-muted-foreground text-xs">
        We only ship within the United States.
      </p>

      {hasNonReturnable && (
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
      )}

      <Button
        type="submit"
        variant="default"
        size="hero"
        className="w-full"
        disabled={hasNonReturnable && !termsAccepted}
      >
        Continue to Shipping
      </Button>
    </form>
  )
}
