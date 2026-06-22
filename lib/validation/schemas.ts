import { z } from "zod"

// ── Password policy ──────────────────────────────────────────────────────────
// Min 8 chars, ≥1 uppercase, ≥1 number, ≥1 special character from the explicit set.
export const PASSWORD_SPECIAL_CHARS = "!@#$%^&*"

export const PasswordRules = {
  length: (s: string) => s.length >= 8,
  upper: (s: string) => /[A-Z]/.test(s),
  number: (s: string) => /\d/.test(s),
  special: (s: string) => /[!@#$%^&*]/.test(s),
}

export function passwordScore(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0
  const passed = [
    PasswordRules.length(password),
    PasswordRules.upper(password),
    PasswordRules.number(password),
    PasswordRules.special(password),
  ].filter(Boolean).length
  if (passed === 4) return 3
  if (passed >= 2) return 2
  return 1
}

const StrongPasswordSchema = z
  .string()
  .min(8, "Must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/\d/, "Must contain a number")
  .regex(/[!@#$%^&*]/, "Must contain a special character (!@#$%^&*)")

/** Sign-up payload for POST /api/auth/signup. */
export const SignupSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: StrongPasswordSchema,
  firstName: z.string().min(1, "Enter your first name").max(80).trim(),
  lastName: z.string().min(1, "Enter your last name").max(80).trim(),
  turnstileToken: z.string().nullable().optional(),
})

export type SignupInput = z.infer<typeof SignupSchema>

/** POST /api/auth/forgot-password */
export const ForgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

/** /reset-password page form */
export const ResetPasswordSchema = z
  .object({
    password: StrongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

/** POST /api/auth/verify-email — code submission. */
export const VerifyEmailSchema = z.object({
  email: z.email("Enter a valid email address"),
  code: z
    .string()
    .length(4, "Code must be 4 digits")
    .regex(/^\d{4}$/, "Code must be 4 digits"),
  password: StrongPasswordSchema,
})

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>

/** POST /api/auth/resend-code */
export const ResendCodeSchema = z.object({
  email: z.email("Enter a valid email address"),
})

export type ResendCodeInput = z.infer<typeof ResendCodeSchema>

/** Sign-in payload used by the client login form. */
export const SignInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type SignInInput = z.infer<typeof SignInSchema>

/**
 * Multipart form fields for POST /api/profile/license/upload.
 * The actual file is validated separately (MIME type + size check).
 */
export const LicenseUploadSchema = z.object({
  profession: z.enum([
    "Cosmetologist",
    "Barber",
    "Colorist",
    "Salon Owner",
    "Esthetician",
  ]),
  licenseNumber: z
    .string()
    .min(2, "License number is required")
    .max(100)
    .trim(),
  businessName: z.string().max(200).trim().optional(),
})

export type LicenseUploadInput = z.infer<typeof LicenseUploadSchema>

/** Body for POST /api/admin/verifications/[id]/reject. */
export const AdminRejectSchema = z.object({
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must be under 500 characters")
    .trim(),
})

export type AdminRejectInput = z.infer<typeof AdminRejectSchema>

// ── License number format validation ──────────────────────────────────────────

interface LicenseFormatRule {
  regex: RegExp
  helperText: string
  errorText: string
}

const LICENSE_FORMAT_RULES: Partial<Record<string, LicenseFormatRule>> = {
  Cosmetologist: {
    regex: /^[CBEA]\d{6,7}$/i,
    helperText: "CA Board: letter + 6–7 digits (e.g. C123456)",
    errorText: "Expected CA Board format: letter + 6–7 digits (e.g. C123456)",
  },
  Barber: {
    regex: /^[CBEA]\d{6,7}$/i,
    helperText: "CA Board: letter + 6–7 digits (e.g. B654321)",
    errorText: "Expected CA Board format: letter + 6–7 digits (e.g. B654321)",
  },
  Colorist: {
    regex: /^[CBEA]\d{6,7}$/i,
    helperText: "CA Board: letter + 6–7 digits (e.g. C123456)",
    errorText: "Expected CA Board format: letter + 6–7 digits (e.g. C123456)",
  },
  Esthetician: {
    regex: /^[CBEA]\d{6,7}$/i,
    helperText: "CA Board: letter + 6–7 digits (e.g. E789012)",
    errorText: "Expected CA Board format: letter + 6–7 digits (e.g. E789012)",
  },
  "Salon Owner": {
    regex: /^[A-Z0-9]{6,}$/i,
    helperText: "Alphanumeric, min 6 characters (e.g. SR123456)",
    errorText: "Must be alphanumeric, min 6 characters",
  },
}

/**
 * Validates a license number against the expected format for the given profession.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateLicenseNumber(
  profession: string,
  licenseNumber: string,
): string | null {
  const rule = LICENSE_FORMAT_RULES[profession]
  if (!rule) {
    return licenseNumber.length >= 4
      ? null
      : "License number must be at least 4 characters"
  }
  return rule.regex.test(licenseNumber) ? null : rule.errorText
}

/** Returns helper text describing the expected license format for a given profession. */
export function getLicenseHelperText(profession: string): string {
  return (
    LICENSE_FORMAT_RULES[profession]?.helperText ??
    "Enter your license number (min 4 characters)"
  )
}
