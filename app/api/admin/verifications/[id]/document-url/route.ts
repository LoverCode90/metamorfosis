import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * GET /api/admin/verifications/[id]/document-url
 *
 * Returns a 60-second signed URL for the user's license document in
 * the private `license-verification` Supabase Storage bucket.
 * Admin-only. Never stores or caches the signed URL.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params

  // ── Admin auth ────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser()

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminUser.id)
    .single()

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // ── Fetch document path ───────────────────────────────────────────────────
  const admin = createAdminClient()
  const { data: target, error: fetchError } = await admin
    .from("profiles")
    .select("document_url")
    .eq("id", id)
    .single()

  if (fetchError || !target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (!target.document_url) {
    return NextResponse.json({ error: "No document on file" }, { status: 404 })
  }

  // ── Generate signed URL (60 seconds) ─────────────────────────────────────
  const { data: signedData, error: signError } = await admin.storage
    .from("license-verification")
    .createSignedUrl(target.document_url, 60)

  if (signError || !signedData?.signedUrl) {
    console.error("[admin/document-url] Signed URL failed:", signError)
    return NextResponse.json(
      { error: "Could not generate document URL" },
      { status: 500 },
    )
  }

  return NextResponse.json({ url: signedData.signedUrl })
}
