import { NextRequest, NextResponse } from "next/server"
import { getTaxRate } from "@/lib/tax"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get("zip")?.trim()
  const state = searchParams.get("state")?.trim()

  if (!zip || !state) {
    return NextResponse.json(
      { error: "zip and state are required" },
      { status: 400 },
    )
  }

  const rate = await getTaxRate(zip, state)
  return NextResponse.json({ rate })
}
