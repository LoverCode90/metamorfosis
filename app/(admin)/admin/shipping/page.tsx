import { redirect } from "next/navigation"

/** `/admin/shipping` has no index — pickups live at `/admin/shipping/pickups`. */
export default function AdminShippingIndexPage() {
  redirect("/admin/shipping/pickups")
}
