import { z } from "zod"

/** Sign-up payload for POST /api/auth/signup. */
export const SignupSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Enter your full name").max(120),
  turnstileToken: z.string().nullable().optional(),
})

export type SignupInput = z.infer<typeof SignupSchema>

/** Sign-in payload used by the client login form. */
export const SignInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type SignInInput = z.infer<typeof SignInSchema>
