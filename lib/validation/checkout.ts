import { z } from "zod"

import { phoneErrorMessage, validatePhone } from "@/lib/utils/phone"

/**
 * Schema for the checkout "Contact & Address" step (step-info).
 * `phone` holds the raw 10-digit string produced by {@link PhoneInput};
 * Hawaii/Alaska and partial input are rejected via the shared phone validator.
 */
export const infoSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Enter a valid email"),
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

export type InfoFormValues = z.infer<typeof infoSchema>
