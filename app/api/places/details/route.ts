import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { placeId } = body

    if (!placeId) {
      return NextResponse.json({ error: "Missing placeId" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 })
    }

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=addressComponents`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
        },
      },
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.error("[Places Details Error]", res.status, errorText)
      return NextResponse.json(
        { error: "Failed to fetch from Places API" },
        { status: res.status },
      )
    }

    const data = await res.json()

    // Map addressComponents (New Places API format) to old Geocoding API format expected by client
    // New format: { longText: string, shortText: string, types: string[] }
    // Old format expected: { long_name: string, short_name: string, types: string[] }
    const address_components = (data.addressComponents || []).map(
      (comp: any) => ({
        long_name: comp.longText,
        short_name: comp.shortText,
        types: comp.types,
      }),
    )

    return NextResponse.json({ address_components })
  } catch (error) {
    console.error("[Places Details Error]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
