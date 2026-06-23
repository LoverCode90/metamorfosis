import { notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { ArrowLeft } from "lucide-react"
import { CaseActions } from "@/components/admin/cases/case-actions"
import { EvidenceGallery } from "@/components/admin/cases/evidence-gallery"

export const metadata = { title: "Case Details — Metamorfosis Beauty Admin" }

function formatStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function AdminCaseDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const params = await props.params
  const admin = createAdminClient()

  const { data: c } = await admin
    .from("cases")
    .select(`
      *,
      profiles (
        id, full_name, email, phone_number
      ),
      orders (
        id, square_order_id, status, created_at, shipping_method
      ),
      product_variations (
        id, name_en, sku, price_cents,
        product_translations (
          is_returnable
        )
      ),
      case_messages (
        id, sender_id, message, created_at
      )
    `)
    .eq("id", params.id)
    .single()

  if (!c) {
    notFound()
  }

  // Sort messages ascending
  const messages = c.case_messages?.sort(
    (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) || []

  const isReturnable = c.product_variations?.product_translations?.is_returnable ?? true

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/cases"
          className="border-border bg-background hover:bg-muted flex h-10 w-10 items-center justify-center rounded-md border transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Case Details
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review issue and manage resolution.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Actions */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-foreground text-lg font-semibold">Resolution Actions</h2>
                <p className="text-muted-foreground text-sm">Current Status: <span className="font-semibold text-foreground">{formatStatus(c.status)}</span></p>
              </div>
            </div>
            <CaseActions caseId={c.id} isReturnable={isReturnable} status={c.status} />
          </section>

          {/* Issue Details */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground text-lg font-semibold mb-4">Issue Details</h2>
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Reason</p>
                <p className="text-foreground font-medium">{formatStatus(c.reason)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Item</p>
                <p className="text-foreground font-medium">{c.product_variations?.name_en}</p>
                <p className="text-muted-foreground text-sm">SKU: {c.product_variations?.sku}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Customer Explanation</p>
              <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                {c.explanation}
              </div>
            </div>
          </section>

          {/* Evidence */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground text-lg font-semibold mb-4">Evidence Photos</h2>
            <EvidenceGallery caseId={c.id} />
          </section>

          {/* Messages */}
          <section className="border-border bg-card rounded-2xl border p-6 flex flex-col min-h-[400px]">
            <h2 className="text-foreground text-lg font-semibold mb-4">Messages</h2>
            <div className="flex-1 space-y-4">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-sm">No messages in this case.</p>
              ) : (
                messages.map((msg: any) => {
                  const isAdmin = msg.sender_id !== c.profiles?.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] rounded-2xl px-4 py-2 ${
                        isAdmin
                          ? "bg-foreground text-background self-end ml-auto rounded-br-sm"
                          : "bg-muted text-foreground self-start mr-auto rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1 opacity-70">
                        {isAdmin ? "Admin Support" : c.profiles?.full_name}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <span className={`text-[10px] mt-1 ${isAdmin ? "text-background/70" : "text-muted-foreground"}`}>
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <section className="border-border bg-card rounded-2xl border p-6">
            <h3 className="text-foreground font-semibold mb-4">Customer Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{c.profiles?.full_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <a href={`mailto:${c.profiles?.email}`} className="text-foreground hover:underline">
                  {c.profiles?.email}
                </a>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p>{c.profiles?.phone_number || "Not provided"}</p>
              </div>
            </div>
          </section>

          <section className="border-border bg-card rounded-2xl border p-6">
            <h3 className="text-foreground font-semibold mb-4">Order Context</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <Link href={`/admin/orders/${c.orders?.id}`} className="text-foreground hover:underline font-medium">
                  {c.orders?.square_order_id}
                </Link>
              </div>
              <div>
                <p className="text-muted-foreground">Order Status</p>
                <p className="capitalize">{c.orders?.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Placed On</p>
                <p>{new Date(c.orders?.created_at || "").toLocaleDateString()}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
