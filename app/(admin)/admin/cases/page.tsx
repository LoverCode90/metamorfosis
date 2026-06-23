import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/helpers"
import { formatDistanceToNow } from "date-fns"

export const metadata = { title: "Cases Admin — Metamorfosis Beauty" }

export default async function AdminCasesPage() {
  await requireAdmin()
  const admin = createAdminClient()

  const { data: cases } = await admin
    .from("cases")
    .select(`
      id,
      status,
      reason,
      created_at,
      profiles (
        full_name,
        email
      ),
      orders (
        square_order_id
      )
    `)
    .order("created_at", { ascending: false })

  const formatStatus = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Cases & Returns
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage support tickets and return requests.
        </p>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Opened</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {cases?.map((c: any) => (
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3 text-foreground font-medium">
                  {c.profiles?.full_name}
                  <div className="text-muted-foreground text-xs font-normal">
                    {c.profiles?.email}
                  </div>
                </td>
                <td className="px-5 py-3 font-medium">
                  {c.orders?.square_order_id.startsWith("MF-")
                    ? c.orders.square_order_id
                    : `#${c.orders?.square_order_id.slice(0, 8).toUpperCase()}`}
                </td>
                <td className="px-5 py-3">{formatStatus(c.reason)}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === "open"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : c.status === "pending_review"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : c.status === "closed"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {formatStatus(c.status)}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/cases/${c.id}`}
                    className="text-foreground hover:underline font-medium text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {cases?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                  No cases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
