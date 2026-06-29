import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input } = body

    if (!input || input.length < 5) {
      return NextResponse.json(
        { error: "Input must be at least 5 characters" },
        { status: 400 },
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 })
    }

    const res = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify({
          input,
          includedRegionCodes: ["US"],
        }),
      },
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.error("[Places Autocomplete Error]", res.status, errorText)
      return NextResponse.json(
        { error: "Failed to fetch from Places API" },
        { status: res.status },
      )
    }

    const data = await res.json()

    // Explicitly type and safely access properties
    const suggestions = (data.suggestions || [])

      .map((item: any) => {
        const placePrediction = item.placePrediction
        if (!placePrediction) return null

        return {
          place_id: placePrediction.placeId,
          description: placePrediction.text?.text,
          main_text: placePrediction.structuredFormat?.mainText?.text,
          secondary_text: placePrediction.structuredFormat?.secondaryText?.text,
        }
      })
      .filter(Boolean)

      .filter((s: any) => {
        if (!s.secondary_text) return true
        return (
          !s.secondary_text.includes(", AK,") &&
          !s.secondary_text.includes(", HI,")
        )
      })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[Places Autocomplete Error]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
