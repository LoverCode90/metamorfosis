import "server-only"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { z } from "zod"
import type { UserRole } from "@/lib/types"

// ── Response schema ────────────────────────────────────────────────────────────

const GeminiResultSchema = z.object({
  license_number: z.string().nullable(),
  full_name: z.string().nullable(),
  issue_date: z.string().nullable(),
  expiration_date: z.string().nullable(),
  issuing_authority: z.string().nullable(),
  document_type: z.enum([
    "cosmetology_license",
    "barber_license",
    "esthetician_license",
    "student_contract",
    "salon_business_license",
    "unknown",
  ]),
  confidence: z.number().min(0).max(1),
  is_expired: z.boolean(),
  flags: z.array(z.string()),
})

export type GeminiVerificationResult = z.infer<typeof GeminiResultSchema>

export type VerificationDecision = "approved" | "pending_review" | "rejected"

// ── Role mapping ───────────────────────────────────────────────────────────────

export type SuggestedRole = Extract<
  UserRole,
  "professional" | "student" | "salon_owner"
> | null

/**
 * Maps a Gemini-detected document type to the appropriate user role.
 * Returns null for unknown types — admin must decide the role manually.
 *
 * - cosmetology/barber/esthetician license → professional
 * - student contract → student
 * - salon/business license → salon_owner
 * - unknown → null (always routes to pending_review)
 */
export function mapDocumentTypeToRole(
  documentType: GeminiVerificationResult["document_type"],
): SuggestedRole {
  switch (documentType) {
    case "cosmetology_license":
    case "barber_license":
    case "esthetician_license":
      return "professional"
    case "student_contract":
      return "student"
    case "salon_business_license":
      return "salon_owner"
    default:
      return null
  }
}

// ── Decision logic ─────────────────────────────────────────────────────────────

/**
 * Maps Gemini result to a verification decision.
 * Auto-approve only when confidence is high, no flags, and not expired.
 * Fail-safe: any ambiguity resolves to pending_review rather than rejection.
 */
export function resolveVerificationDecision(
  result: GeminiVerificationResult,
): VerificationDecision {
  if (result.is_expired) return "rejected"
  if (result.confidence < 0.5) return "rejected"
  if (result.confidence >= 0.85 && result.flags.length === 0) return "approved"
  return "pending_review"
}

// ── Gemini prompt ──────────────────────────────────────────────────────────────

const VERIFICATION_PROMPT = `
You are reviewing a beauty industry license or professional contract document. Extract:
- License number (alphanumeric, may include dashes)
- Full name on the license
- Issue date (YYYY-MM-DD if visible)
- Expiration date (YYYY-MM-DD if visible)
- Issuing authority (state board, school name, business name)
- Document type: 'cosmetology_license' | 'barber_license' | 'esthetician_license' |
                 'student_contract' | 'salon_business_license' | 'unknown'

Also determine:
- Whether the document is expired based on the expiration date
- Any concerns: blurry, partial, suspicious, signs of tampering or digital editing, illegible fields

Return JSON only — no markdown, no preamble, no explanation:
{
  "license_number": string | null,
  "full_name": string | null,
  "issue_date": string | null,
  "expiration_date": string | null,
  "issuing_authority": string | null,
  "document_type": string,
  "confidence": number,
  "is_expired": boolean,
  "flags": string[]
}
`.trim()

// ── Gemini client ──────────────────────────────────────────────────────────────

let _genAI: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI {
  if (_genAI) return _genAI
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error("GEMINI_API_KEY is not set")
  _genAI = new GoogleGenerativeAI(key)
  return _genAI
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Sends a document image/PDF buffer to Gemini Vision for extraction and
 * authenticity analysis. Returns a structured result with a confidence score.
 *
 * On any API error the function returns a safe fallback that will resolve to
 * pending_review — never auto-rejects on a transient failure.
 */
export async function analyzeDocument(
  fileBuffer: Buffer,
  mimeType: string,
): Promise<GeminiVerificationResult> {
  const SAFE_FALLBACK: GeminiVerificationResult = {
    license_number: null,
    full_name: null,
    issue_date: null,
    expiration_date: null,
    issuing_authority: null,
    document_type: "unknown",
    confidence: 0.6,
    is_expired: false,
    flags: ["gemini_api_error"],
  }

  try {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const base64 = fileBuffer.toString("base64")

    const result = await model.generateContent([
      VERIFICATION_PROMPT,
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ])

    const text = result.response.text().trim()

    // Strip markdown code fences if the model includes them despite the prompt
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    const parsed = JSON.parse(cleaned) as unknown

    const validated = GeminiResultSchema.safeParse(parsed)
    if (!validated.success) {
      console.error(
        "[gemini] Response validation failed:",
        validated.error.issues,
      )
      return SAFE_FALLBACK
    }

    return validated.data
  } catch (err) {
    console.error("[gemini] analyzeDocument error:", err)
    return SAFE_FALLBACK
  }
}
