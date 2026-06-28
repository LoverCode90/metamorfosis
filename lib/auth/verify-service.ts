import { createHash } from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendWelcomeEmail } from "@/lib/email/resend"

const MAX_ATTEMPTS = 3
const BLOCK_MINUTES = 20
const MAX_BLOCKS = 3

export interface VerifySessionResult {
  status: number
  error?: string
  userData?: {
    email: string
    firstName: string
    lastName: string
    fullName: string
  }
}

export async function validateVerificationCode(
  email: string,
  code: string,
): Promise<VerifySessionResult> {
  const admin = createAdminClient()

  const { data: banned } = await admin
    .from("banned_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  if (banned) {
    return {
      status: 403,
      error:
        "This email address is not eligible for registration. Contact support if you believe this is an error.",
    }
  }

  const { data: pending } = await admin
    .from("pending_signups")
    .select("*")
    .eq("email", email)
    .maybeSingle<{
      id: string
      email: string
      full_name: string
      first_name: string | null
      last_name: string | null
      code_hash: string
      expires_at: string
      attempt_count: number
      block_count: number
      blocked_until: string | null
      resend_count: number
      resend_window_start: string
    }>()

  if (!pending) {
    return {
      status: 400,
      error: "Verification code not found or expired. Please sign up again.",
    }
  }

  if (new Date(pending.expires_at) < new Date()) {
    await admin.from("pending_signups").delete().eq("email", email)
    return {
      status: 400,
      error: "Your code has expired. Please sign up again.",
    }
  }

  if (pending.blocked_until && new Date(pending.blocked_until) > new Date()) {
    const remainingMs = new Date(pending.blocked_until).getTime() - Date.now()
    const remainingMin = Math.ceil(remainingMs / 60000)
    return {
      status: 429,
      error: `Too many wrong attempts. Try again in ${remainingMin} minute${remainingMin !== 1 ? "s" : ""}.`,
    }
  }

  const submittedHash = createHash("sha256").update(code).digest("hex")
  const codeCorrect = submittedHash === pending.code_hash

  if (!codeCorrect) {
    const newAttemptCount = pending.attempt_count + 1

    if (newAttemptCount >= MAX_ATTEMPTS) {
      const newBlockCount = pending.block_count + 1

      if (newBlockCount >= MAX_BLOCKS) {
        await admin.from("banned_emails").insert({
          email,
          reason: "too_many_verification_failures",
        })
        await admin.from("pending_signups").delete().eq("email", email)
        return {
          status: 403,
          error:
            "This email has been blocked due to too many failed attempts. Contact support.",
        }
      }

      const blockedUntil = new Date(
        Date.now() + BLOCK_MINUTES * 60 * 1000,
      ).toISOString()
      await admin
        .from("pending_signups")
        .update({
          attempt_count: 0,
          block_count: newBlockCount,
          blocked_until: blockedUntil,
        })
        .eq("email", email)

      return {
        status: 429,
        error: `Incorrect code. Too many attempts — try again in ${BLOCK_MINUTES} minutes.`,
      }
    }

    await admin
      .from("pending_signups")
      .update({ attempt_count: newAttemptCount })
      .eq("email", email)

    const remaining = MAX_ATTEMPTS - newAttemptCount
    return {
      status: 400,
      error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
    }
  }

  const firstName = pending.first_name ?? pending.full_name.split(" ")[0] ?? ""
  const lastName =
    pending.last_name ?? pending.full_name.split(" ").slice(1).join(" ").trim()

  return {
    status: 200,
    userData: {
      email,
      firstName,
      lastName,
      fullName: pending.full_name,
    },
  }
}

export async function createVerifiedUser(
  email: string,
  password: string,
  fullName: string,
  firstName: string,
  lastName: string,
): Promise<{ status: number; error?: string; userId?: string }> {
  const admin = createAdminClient()

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
      },
    })

  if (createError) {
    if (createError.message.toLowerCase().includes("already been registered")) {
      await admin.from("pending_signups").delete().eq("email", email)
      return {
        status: 409,
        error: "An account with this email already exists. Please sign in.",
      }
    }
    console.error("[verify-email] createUser failed:", createError)
    return {
      status: 500,
      error: "Account creation failed. Please try again.",
    }
  }

  if (!created.user) {
    return {
      status: 500,
      error: "Account creation failed. Please try again.",
    }
  }

  await admin
    .from("profiles")
    .update({ first_name: firstName, last_name: lastName })
    .eq("id", created.user.id)

  return { status: 200, userId: created.user.id }
}

export async function cleanupAndWelcome(
  email: string,
  firstName: string,
): Promise<void> {
  const admin = createAdminClient()
  await admin.from("pending_signups").delete().eq("email", email)

  try {
    await sendWelcomeEmail({
      to: email,
      name: firstName,
    })
  } catch (error) {
    console.error("[verify-email] welcome email failed:", error)
  }
}
