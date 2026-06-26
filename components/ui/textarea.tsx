import * as React from "react"

import { cn } from "@/lib/utils"

/** Multiline text input styled to match the shadcn {@link Input}. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border bg-input text-foreground min-h-[120px] w-full rounded-md border px-3 py-2 text-sm transition-colors outline-none",
        "placeholder:text-muted-foreground",
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

export { Textarea }
