"use client"

import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CATEGORY_TREE } from "@/lib/catalog/filter-constants"
import { cn } from "@/lib/utils"

interface FilterCategoryTreeProps {
  /** Selected category keys, formatted as "Parent > Child". */
  selected: string[]
  /** Parents whose children are expanded. */
  open: Set<string>
  onToggleOpen: (parent: string) => void
  onToggleCategory: (key: string) => void
}

/** Collapsible parent → child category checklist. */
export function FilterCategoryTree({
  selected,
  open,
  onToggleOpen,
  onToggleCategory,
}: FilterCategoryTreeProps) {
  return (
    <div>
      <h3 className="text-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        Category
      </h3>
      <ul className="flex flex-col gap-0.5">
        {CATEGORY_TREE.map(({ parent, children }) => {
          const isOpen = open.has(parent)
          const someChildChecked = children.some((c) =>
            selected.includes(`${parent} > ${c}`),
          )
          const parentLabelClass = cn(
            "font-medium",
            someChildChecked ? "text-accent-violet" : "text-muted-foreground",
          )
          const chevronClass = cn(
            "text-muted-foreground h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180",
          )

          return (
            <li key={parent}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleOpen(parent)}
                className="h-auto w-full justify-between py-1.5"
              >
                <span className={parentLabelClass}>{parent}</span>
                <ChevronDown className={chevronClass} strokeWidth={1.75} />
              </Button>

              {isOpen && (
                <ul className="mt-0.5 ml-3 flex flex-col gap-0.5">
                  {children.map((child) => {
                    const key = `${parent} > ${child}`
                    const checked = selected.includes(key)
                    const childLabelClass = cn(
                      "text-sm",
                      checked
                        ? "text-accent-violet font-medium"
                        : "text-muted-foreground",
                    )

                    return (
                      <li key={child}>
                        <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => onToggleCategory(key)}
                          />
                          <span className={childLabelClass}>{child}</span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
