"use client"

import { useState } from "react"
import { ChevronDown, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** Collapsible promo-code entry. Codes are validated server-side at checkout. */
export function PromoCode() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")

  const chevronClass = cn(
    "text-muted-foreground h-4 w-4 transition-transform",
    open && "rotate-180",
  )

  return (
    <div className="border-border mt-4 rounded-lg border sm:mt-5">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-foreground h-auto w-full justify-between px-3 py-2.5 sm:px-3.5 sm:py-3"
      >
        <span className="flex items-center gap-2">
          <Tag className="text-muted-foreground h-4 w-4" strokeWidth={1.75} />
          Have a promo code?
        </span>
        <ChevronDown className={chevronClass} />
      </Button>
      {open && (
        <div className="border-border flex gap-2 border-t p-2.5 sm:p-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            className="h-9 flex-1 sm:h-10"
          />
          <Button type="button" className="h-9 shrink-0 sm:h-10">
            Apply
          </Button>
        </div>
      )}
    </div>
  )
}
