import { createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  analyzeDocument,
  resolveVerificationDecision,
  mapDocumentTypeToRole,
} from "@/lib/gemini/verify"
import { licenseUploadLimiter } from "@/lib/rate-limit"
import {
  LicenseUploadSchema,
  validateLicenseNumber,
} from "@/lib/validation/schemas"
import {
  sendVerificationPending,
  sendVerificationApproved,
  sendVerificationRejected,
} from "@/lib/email/resend"

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
])
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

function getExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  }
  return map[mimeType] ?? "bin"
}

/**
 * Loose name match: at least half the profile-name words must appear in the
 * Gemini-extracted name (case-insensitive, ignores non-alpha chars).
 */
function namesMatch(profileName: string, geminiName: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim()
  const profileWords = normalize(profileName)
    .split(/\s+/)
    .filter((w) => w.length > 1)
  if (profileWords.length === 0) return true
  const geminiNorm = normalize(geminiName)
  const matchCount = profileWords.filter((w) => geminiNorm.includes(w)).length
  return matchCount >= Math.ceil(profileWords.length / 2)
}

/**
 * POST /api/profile/license/upload
 *
 * Accepts multipart/form-data with:
 *   - file: the license document (image or PDF)
 *   - profession: "Cosmetologist" | "Barber" | "Colorist" | "Salon Owner" | "Esthetician"
 *   - licenseNumber: string
 *   - businessName?: string
 *
 * Steps:
 * 1. Auth required
 * 2. Rate limit: 3 uploads per hour per IP
 * 3. Validate fields + license number format (before Gemini call)
 * 4. Validate file type and size
 * 5. Fetch profile for name-match check
 * 6. Upload to Supabase Storage: license-verification/{userId}/license.{ext}
 * 7. Run Gemini Vision analysis
 * 8. Name match check — add name_mismatch flag if names differ
 * 9. Apply decision rules → update profile role + status
 * 10. Write audit log
 * 11. Send email notification
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"

  const { success: withinLimit } = await licenseUploadLimiter.limit(
    `license-upload:${ip}`,
  )
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many upload attempts. Try again in an hour." },
      { status: 429 },
    )
  }

  // ── Parse multipart form ──────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // ── Validate field inputs ─────────────────────────────────────────────────
  const fieldsParsed = LicenseUploadSchema.safeParse({
    profession: formData.get("profession"),
    licenseNumber: formData.get("licenseNumber"),
    businessName: formData.get("businessName") ?? undefined,
  })
  if (!fieldsParsed.success) {
    return NextResponse.json(
      { error: fieldsParsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    )
  }
  const { profession, licenseNumber, businessName } = fieldsParsed.data

  // ── Pre-validate license number format (never waste a Gemini call on bad input)
  const licenseFormatError = validateLicenseNumber(profession, licenseNumber)
  if (licenseFormatError) {
    return NextResponse.json({ error: licenseFormatError }, { status: 400 })
  }

  // ── Validate file ─────────────────────────────────────────────────────────
  const mimeType = file.type
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json(
      {
        error: "Unsupported file type. Please upload a JPG, PNG, WebP, or PDF.",
      },
      { status: 400 },
    )
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Maximum size is 10 MB." },
      { status: 400 },
    )
  }

  // ── Fetch profile (needed for name-match check) ───────────────────────────
  const admin = createAdminClient()
  const { data: currentProfile } = await admin
    .from("profiles")
    .select("email, full_name, role")
    .eq("id", user.id)
    .single()

  const profileEmail = currentProfile?.email ?? user.email ?? ""
  const profileName = currentProfile?.full_name ?? ""

  // ── Upload to Supabase Storage ─────────────────────────────────────────────
  const ext = getExt(mimeType)
  const storagePath = `${user.id}/license.${ext}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  // ── Document hash duplicate check ─────────────────────────────────────────
  const documentHash = createHash("sha256").update(fileBuffer).digest("hex")

  const { data: duplicateRow } = await admin
    .from("profiles")
    .select("id")
    .eq("document_hash", documentHash)
    .neq("id", user.id)
    .maybeSingle()

  if (duplicateRow) {
    return NextResponse.json(
      {
        error:
          "This document has already been submitted by another account. Contact support if you believe this is an error.",
      },
      { status: 400 },
    )
  }

  const { error: uploadError } = await admin.storage
    .from("license-verification")
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true, // overwrite on re-upload
    })

  if (uploadError) {
    console.error("[license-upload] Storage upload failed:", uploadError)
    return NextResponse.json(
      { error: "Document upload failed. Please try again." },
      { status: 500 },
    )
  }

  // ── Save document path, hash, and form data to profile ───────────────────
  await admin
    .from("profiles")
    .update({
      document_url: storagePath,
      document_hash: documentHash,
      license_number: licenseNumber,
      ...(businessName ? { business_name: businessName } : {}),
      verification_status: "pending_review",
    })
    .eq("id", user.id)

  // ── Gemini Vision analysis ─────────────────────────────────────────────────
  const geminiResult = await analyzeDocument(fileBuffer, mimeType)

  // ── Name match check ──────────────────────────────────────────────────────
  // If Gemini extracted a name and it doesn't match the account name, flag it.
  // This prevents auto-approval when someone uploads someone else's license.
  let finalResult = geminiResult
  if (geminiResult.full_name && profileName) {
    if (!namesMatch(profileName, geminiResult.full_name)) {
      finalResult = {
        ...geminiResult,
        flags: [...geminiResult.flags, "name_mismatch"],
      }
    }
  }

  const decision = resolveVerificationDecision(finalResult)

  // ── Apply decision ─────────────────────────────────────────────────────────
  if (decision === "approved") {
    const suggestedRole = mapDocumentTypeToRole(finalResult.document_type)

    await admin
      .from("profiles")
      .update({
        verification_status: "approved",
        expiration_date: finalResult.expiration_date,
        rejection_reason: null,
        ...(suggestedRole ? { role: suggestedRole } : {}),
      })
      .eq("id", user.id)

    await admin.from("audit_logs").insert({
      admin_id: user.id,
      action: "gemini_auto_approved",
      target_table: "profiles",
      target_id: user.id,
      new_value: {
        verification_status: "approved",
        confidence: finalResult.confidence,
        document_type: finalResult.document_type,
        extracted_name: finalResult.full_name,
        expiration_date: finalResult.expiration_date,
        suggested_role: suggestedRole,
        profession,
      },
    })

    sendVerificationApproved({ to: profileEmail, name: profileName }).catch(
      (err) => console.error("[license-upload] Approval email failed:", err),
    )
  } else if (decision === "rejected") {
    // Specific wording for expired documents vs. unverifiable documents.
    const rejectionReason = finalResult.is_expired
      ? "Your license appears to be expired. Please renew it and upload a valid document."
      : "Document could not be verified automatically. Please re-upload a clear, unedited photo of your license."

    await admin
      .from("profiles")
      .update({
        verification_status: "rejected",
        rejection_reason: rejectionReason,
      })
      .eq("id", user.id)

    await admin.from("audit_logs").insert({
      admin_id: user.id,
      action: "gemini_auto_rejected",
      target_table: "profiles",
      target_id: user.id,
      new_value: {
        verification_status: "rejected",
        confidence: finalResult.confidence,
        is_expired: finalResult.is_expired,
        flags: finalResult.flags,
        profession,
      },
    })

    sendVerificationRejected({
      to: profileEmail,
      name: profileName,
      reason: rejectionReason,
    }).catch((err) =>
      console.error("[license-upload] Rejection email failed:", err),
    )
  } else {
    // pending_review — Gemini uncertain or name mismatch; admin reviews manually
    await admin.from("audit_logs").insert({
      admin_id: user.id,
      action: "verification_pending",
      target_table: "profiles",
      target_id: user.id,
      new_value: {
        verification_status: "pending_review",
        confidence: finalResult.confidence,
        flags: finalResult.flags,
        document_type: finalResult.document_type,
        name_mismatch: finalResult.flags.includes("name_mismatch"),
        profession,
      },
    })

    sendVerificationPending({ to: profileEmail, name: profileName }).catch(
      (err) => console.error("[license-upload] Pending email failed:", err),
    )
  }

  return NextResponse.json({
    ok: true,
    status: decision,
    message:
      decision === "approved"
        ? "Your license has been verified. Professional pricing is now unlocked."
        : decision === "rejected"
          ? finalResult.is_expired
            ? "Your license appears to be expired. Please renew it and upload a valid document."
            : "We could not verify your document automatically. Please re-upload a clear, unedited image."
          : "Your document has been submitted for review. We'll notify you within 1 business day.",
  })
}
