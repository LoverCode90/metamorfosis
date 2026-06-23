import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: caseId } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabaseAdmin = createAdminClient()

    // The evidence paths are stored on the case row (uploaded by the client to
    // {userId}/{caseId}/{n}.ext). The folder name is the client-generated id,
    // which does NOT match this row's DB id, so listing by caseId finds nothing.
    // Use the stored paths directly — they are the source of truth.
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from("cases")
      .select("evidence_images_urls")
      .eq("id", caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const filePaths = caseData.evidence_images_urls ?? []

    if (filePaths.length === 0) {
      return NextResponse.json({ signedUrls: [] })
    }

    const { data: signedUrlsData, error: signedError } =
      await supabaseAdmin.storage
        .from("case-evidence")
        .createSignedUrls(filePaths, 60)

    if (signedError || !signedUrlsData) {
      return NextResponse.json(
        { error: "Failed to generate signed URLs" },
        { status: 500 },
      )
    }

    const urls = signedUrlsData.map((s) => s.signedUrl)
    return NextResponse.json({ signedUrls: urls })
  } catch (error) {
    console.error("[GET /api/admin/cases/[id]/evidence]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
