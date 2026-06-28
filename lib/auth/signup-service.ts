import { createHash, randomInt } from "crypto"
import { promises as dns } from "dns"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendVerificationCode } from "@/lib/email/resend"
import disposableDomains from "disposable-email-domains"

const EXTRA_BLOCKED_DOMAINS = new Set([
  "xgshare.com",
  "mailinator.com",
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "throwam.com",
  "yopmail.com",
  "trashmail.com",
  "maildrop.cc",
  "sharklasers.com",
])

const CODE_EXPIRY_MINUTES = 10

export async function checkDisposableEmail(
  emailDomain: string,
): Promise<boolean> {
  if (
    EXTRA_BLOCKED_DOMAINS.has(emailDomain) ||
    (disposableDomains as string[]).includes(emailDomain)
  ) {
    return true
  }

  try {
    const records = await dns.resolveMx(emailDomain)
    return records.length === 0
  } catch {
    return true
  }
}

export async function checkExistingAccount(
  email: string,
): Promise<{ banned: boolean; exists: boolean }> {
  const admin = createAdminClient()

  const { data: banned } = await admin
    .from("banned_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  if (banned) {
    return { banned: true, exists: false }
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle()

  const exists = Boolean(existingProfile)

  return { banned: false, exists }
}

export async function processSignupSession(
  email: string,
  fullName: string,
  firstName: string,
  lastName: string,
  ipAddress: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient()
  const code = String(randomInt(1000, 10000)).padStart(4, "0")
  const codeHash = createHash("sha256").update(code).digest("hex")
  const expiresAt = new Date(
    Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000,
  ).toISOString()

  const { error: upsertError } = await admin.from("pending_signups").upsert(
    {
      email,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempt_count: 0,
      block_count: 0,
      blocked_until: null,
      resend_count: 0,
      resend_window_start: new Date().toISOString(),
      resend_block_count: 0,
      resend_blocked_until: null,
      ip: ipAddress,
    },
    { onConflict: "email" },
  )

  if (upsertError) {
    console.error("[signup] pending_signups upsert failed:", upsertError)
    return { success: false, error: "Signup failed. Please try again." }
  }

  try {
    await sendVerificationCode({
      to: email,
      name: firstName,
      code,
      expiresInMinutes: CODE_EXPIRY_MINUTES,
    })
    return { success: true }
  } catch (error) {
    console.error("[signup] verification email failed:", error)
    await admin.from("pending_signups").delete().eq("email", email)
    return {
      success: false,
      error:
        "We could not send a verification email. Please check your address and try again.",
    }
  }
}
