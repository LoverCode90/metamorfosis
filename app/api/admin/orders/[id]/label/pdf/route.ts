import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/require-admin"
import { getTransactionLabelUrl } from "@/lib/shippo/purchase-label"
import { normalizeLabelPdfToPortrait } from "@/lib/shippo/normalize-label-pdf"

/** Streams the Shippo label PDF through our origin so the admin can print it. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    const gate = await requireAdmin(supabase)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const admin = createAdminClient()
    const { data: order, error } = await admin
      .from("orders")
      .select("id, shippo_transaction_id")
      .eq("id", orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    if (!order.shippo_transaction_id) {
      return NextResponse.json(
        { error: "No shipping label exists for this order" },
        { status: 404 },
      )
    }

    const { labelUrl } = await getTransactionLabelUrl(
      order.shippo_transaction_id,
    )
    if (!labelUrl) {
      return NextResponse.json(
        { error: "Label URL is not available from Shippo" },
        { status: 502 },
      )
    }

    const pdfRes = await fetch(labelUrl)
    if (!pdfRes.ok) {
      return NextResponse.json(
        { error: "Could not download label PDF from Shippo" },
        { status: 502 },
      )
    }

    const rawPdfBytes = await pdfRes.arrayBuffer()
    const skipNormalize = new URL(req.url).searchParams.get("raw") === "1"
    const pdfBytes = skipNormalize
      ? new Uint8Array(rawPdfBytes)
      : await normalizeLabelPdfToPortrait(rawPdfBytes)

    const download =
      new URL(req.url).searchParams.get("download") === "1"
        ? "attachment"
        : "inline"

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download}; filename="label-${orderId.slice(0, 8)}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("[GET /api/admin/orders/[id]/label/pdf]", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
