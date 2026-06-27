import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // text-base (16px) prevents iOS/Android zoom on focus.
        "border-border bg-input text-foreground h-10 w-full max-w-full min-w-0 rounded-md border px-3 py-1 text-base transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
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

export { Input }
