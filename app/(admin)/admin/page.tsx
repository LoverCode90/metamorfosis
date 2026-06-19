import { requireAdmin } from "@/lib/auth/helpers"

/**
 * Admin dashboard — protected by requireAdmin() which verifies the user has
 * role = 'admin' in the profiles table. Redirects to /login or /403 otherwise.
 */
export default async function AdminPage() {
  await requireAdmin()

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">
        Admin Dashboard
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        This section is under construction. See{" "}
        <code className="bg-muted rounded px-1 py-0.5 text-xs">
          docs/05_Admin_Setup.md
        </code>{" "}
        for setup instructions.
      </p>
    </main>
  )
}
