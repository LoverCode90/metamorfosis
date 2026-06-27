"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { AddressFormFields } from "@/components/checkout/steps/address-form-fields"
import { SavedAddressBanner } from "@/components/checkout/steps/saved-address-banner"
import { TermsCheckbox } from "@/components/checkout/steps/terms-checkbox"
import { Button } from "@/components/ui/button"
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
    enabled: !skipAddressFetch,
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
        <div className="border-border bg-muted/40 space-y-3 rounded-lg border p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-12 w-full rounded-md" />
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
