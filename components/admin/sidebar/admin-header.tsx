"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AdminBreadcrumbs } from "@/components/admin/sidebar/admin-breadcrumbs"

/** Top bar inside the admin content area — toggle + breadcrumbs. */
export function AdminHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          <AdminBreadcrumbs />
        </div>
      </div>
    </header>
  )
}
