"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Control, Controller, useForm, useWatch } from "react-hook-form"
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
  defaultValues?: Partial<InfoFormValues> | undefined
  isAuthenticated: boolean
  skipAddressFetch?: boolean
  onContinue: (data: CheckoutAddress, termsAccepted: boolean) => void
}

function TermsCheckbox({ control }: { control: Control<InfoFormValues> }) {
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

export function StepInfo({
  hasNonReturnable,
  defaultValues,
  isAuthenticated,
  skipAddressFetch = false,
  onContinue,
}: StepInfoProps) {
  const [usingSaved, setUsingSaved] = useState(false)
  const router = useRouter()

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
    (addr: CheckoutAddress) => {
      setUsingSaved(true)
      reset(addressToInfoValues(addr))
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
  if (usingSaved && savedAddress) {
    return (
      <div className="space-y-6">
        {heading}
        <SavedAddressBanner
          address={savedAddress}
          onEdit={() => router.push("/profile/addresses?from=checkout")}
        />
        {hasNonReturnable && <TermsCheckbox control={control} />}
        <Button
          type="button"
          variant="default"
          size="hero"
          className="w-full"
          disabled={hasNonReturnable && !termsAccepted}
          onClick={handleSubmit(onSubmit)}
        >
          Continue to Shipping
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {heading}
      <AddressFormFields
        register={register}
        control={control}
        errors={errors}
        setValue={setValue}
        disabled={false}
      />
      <p className="text-muted-foreground text-xs">
        We only ship within the United States.
      </p>
      {hasNonReturnable && <TermsCheckbox control={control} />}
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
