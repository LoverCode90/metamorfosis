import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: caseId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

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

    // Fetch case to see the image urls (Wait, case.evidence_images_urls are actually the full URL?)
    // In profile/cases it saves full URLs or just paths? The prompt says "frontend should upload to case-evidence bucket directly and just pass the URLs in the payload. So just accept an array of strings (max 3)".
    // But then the spec says "Returns 60-second signed URLs for the evidence_images_urls of the case."
    // If they are URLs, we'd need paths to generate signed URLs. Let's just list the directory in Supabase Storage since the folder structure is {case_id}/{filename} and generate signed urls for everything in that directory.
    // Or we parse the paths from evidence_images_urls.
    // Listing the bucket directly for the case_id is safer and simpler.
    
    const { data: files, error: listError } = await supabaseAdmin.storage.from("case-evidence").list(caseId)

    if (listError || !files) {
      return NextResponse.json({ error: "Failed to list evidence" }, { status: 500 })
    }

    if (files.length === 0) {
      return NextResponse.json({ signedUrls: [] })
    }

    const filePaths = files.map((file) => `${caseId}/${file.name}`)
    
    const { data: signedUrlsData, error: signedError } = await supabaseAdmin.storage
      .from("case-evidence")
      .createSignedUrls(filePaths, 60)

    if (signedError || !signedUrlsData) {
      return NextResponse.json({ error: "Failed to generate signed URLs" }, { status: 500 })
    }

    const urls = signedUrlsData.map(s => s.signedUrl)
    return NextResponse.json({ signedUrls: urls })
  } catch (error) {
    console.error("[GET /api/admin/cases/[id]/evidence]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
