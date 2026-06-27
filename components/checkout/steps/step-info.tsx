"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { AddressFormFields } from "@/components/checkout/steps/address-form-fields"
import { SavedAddressBanner } from "@/components/checkout/steps/saved-address-banner"
import { TermsCheckbox } from "@/components/checkout/steps/terms-checkbox"
import { Button } from "@/components/ui/button"
import {
  buildInfoDefaults,
  infoValuesToAddress,
} from "@/lib/checkout/info-form"
import type { CheckoutAddress } from "@/lib/checkout/types"
import { infoSchema, type InfoFormValues } from "@/lib/validation/checkout"

interface StepInfoProps {
  hasNonReturnable: boolean
  defaultValues?: Partial<InfoFormValues> | undefined
  preloadedAddress?: CheckoutAddress | null
  onContinue: (data: CheckoutAddress, termsAccepted: boolean) => void
}

export function StepInfo({
  hasNonReturnable,
  defaultValues,
  preloadedAddress,
  onContinue,
}: StepInfoProps) {
  const [usingSaved, setUsingSaved] = useState(() => !!preloadedAddress)
  const savedAddress = preloadedAddress ?? null
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: buildInfoDefaults(defaultValues),
  })

  const termsAccepted = useWatch({ control, name: "termsAccepted" })

  function onSubmit(values: InfoFormValues) {
    if (hasNonReturnable && !values.termsAccepted) return
    onContinue(infoValuesToAddress(values), !!values.termsAccepted)
  }

  const heading = (
    <h2 className="text-foreground text-lg font-semibold">Contact & Address</h2>
  )

  if (usingSaved && savedAddress) {
    return (
      <div className="space-y-6">
        {heading}
        <SavedAddressBanner
          address={savedAddress}
          onEdit={() => {
            setUsingSaved(false)
            router.push("/profile/addresses?from=checkout")
          }}
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
