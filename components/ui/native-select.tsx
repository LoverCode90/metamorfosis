import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Styled native `<select>` matching the {@link Input} look. Use for static
 * option lists (e.g. US states) where a full popover dropdown is unnecessary.
 * Forwards all native select props and the ref via react-hook-form `register`.
 */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "border-border bg-input text-foreground h-10 w-full min-w-0 rounded-md border px-3 text-sm transition-colors outline-none",
        "hover:border-border-strong",
        "focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-3",
        className,
      )}
      {...props}
    />
  )
}

export { NativeSelect }
