import { notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { ArrowLeft } from "lucide-react"
import { CaseActions } from "@/components/admin/cases/case-actions"
import { EvidenceGallery } from "@/components/admin/cases/evidence-gallery"
import { formatCaseStatus } from "@/lib/utils/format"
import type { AdminCaseDetail } from "@/lib/cases/types"

export const metadata = { title: "Case Details — Metamorfosis Beauty Admin" }

export default async function AdminCaseDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const params = await props.params
  const admin = createAdminClient()

  const { data } = await admin
    .from("cases")
    .select(
      `
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
    `,
    )
    .eq("id", params.id)
    .single()

  const c = data as unknown as AdminCaseDetail | null

  if (!c) {
    notFound()
  }

  // Sort messages ascending
  const messages = [...(c.case_messages ?? [])].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const isReturnable =
    c.product_variations?.product_translations?.is_returnable ?? true

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
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-foreground text-lg font-semibold">
                  Resolution Actions
                </h2>
                <p className="text-muted-foreground text-sm">
                  Current Status:{" "}
                  <span className="text-foreground font-semibold">
                    {formatCaseStatus(c.status)}
                  </span>
                </p>
              </div>
            </div>
            <CaseActions
              caseId={c.id}
              isReturnable={isReturnable}
              status={c.status}
            />
          </section>

          {/* Issue Details */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              Issue Details
            </h2>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Reason
                </p>
                <p className="text-foreground font-medium">
                  {formatCaseStatus(c.reason)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Item
                </p>
                <p className="text-foreground font-medium">
                  {c.product_variations?.name_en}
                </p>
                <p className="text-muted-foreground text-sm">
                  SKU: {c.product_variations?.sku}
                </p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
                Customer Explanation
              </p>
              <div className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">
                {c.explanation}
              </div>
            </div>
          </section>

          {/* Evidence */}
          <section className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              Evidence Photos
            </h2>
            <EvidenceGallery caseId={c.id} />
          </section>

          {/* Messages */}
          <section className="border-border bg-card flex min-h-[400px] flex-col rounded-2xl border p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              Messages
            </h2>
            <div className="flex-1 space-y-4">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No messages in this case.
                </p>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender_id !== c.profiles?.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex max-w-[80%] flex-col rounded-2xl px-4 py-2 ${
                        isAdmin
                          ? "bg-foreground text-background ml-auto self-end rounded-br-sm"
                          : "bg-muted text-foreground mr-auto self-start rounded-bl-sm"
                      }`}
                    >
                      <p className="mb-1 text-sm font-semibold opacity-70">
                        {isAdmin ? "Admin Support" : c.profiles?.full_name}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      <span
                        className={`mt-1 text-[10px] ${isAdmin ? "text-background/70" : "text-muted-foreground"}`}
                      >
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
            <h3 className="text-foreground mb-4 font-semibold">
              Customer Info
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{c.profiles?.full_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <a
                  href={`mailto:${c.profiles?.email}`}
                  className="text-foreground hover:underline"
                >
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
            <h3 className="text-foreground mb-4 font-semibold">
              Order Context
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <Link
                  href={`/admin/orders/${c.orders?.id}`}
                  className="text-foreground font-medium hover:underline"
                >
                  {c.orders?.square_order_id}
                </Link>
              </div>
              <div>
                <p className="text-muted-foreground">Order Status</p>
                <p className="capitalize">{c.orders?.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Placed On</p>
                <p>
                  {new Date(c.orders?.created_at || "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
