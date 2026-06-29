"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { AddressFormFields } from "@/components/checkout/steps/address-form-fields"
import { SavedAddressBanner } from "@/components/checkout/steps/saved-address-banner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  buildInfoDefaults,
  infoValuesToAddress,
} from "@/lib/checkout/info-form"
import type { CheckoutAddress } from "@/lib/checkout/types"
import { infoSchema, type InfoFormValues } from "@/lib/validation/checkout"

interface StepInfoProps {
  defaultValues?: Partial<InfoFormValues> | undefined
  preloadedAddress?: CheckoutAddress | null
  isUserLoading?: boolean
  onContinue: (data: CheckoutAddress, termsAccepted: boolean) => void
}

export function StepInfo({
  defaultValues,
  preloadedAddress,
  isUserLoading,
  onContinue,
}: StepInfoProps) {
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

  function onSubmit(values: InfoFormValues) {
    onContinue(infoValuesToAddress(values), true)
  }

  const heading = (
    <h2 className="text-foreground text-lg font-semibold">
      Contact &amp; Address
    </h2>
  )

  if (isUserLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
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

  if (preloadedAddress) {
    return (
      <div className="space-y-6">
        {heading}
        <SavedAddressBanner
          address={preloadedAddress}
          onEdit={() =>
            router.push("/profile/addresses?from=checkout&step=info")
          }
        />
        <Button
          type="button"
          variant="default"
          size="hero"
          className="w-full"
          onClick={() => onContinue(preloadedAddress, true)}
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
      <Button type="submit" variant="default" size="hero" className="w-full">
        Continue to Shipping
      </Button>
    </form>
  )
}
