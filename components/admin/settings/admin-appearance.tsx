"use client"

import { Type } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  FONT_SIZE_LABELS,
  FONT_SIZE_ORDER,
  useAdminPrefs,
  type AdminFontSize,
} from "@/components/admin/admin-shell"
import { cn } from "@/lib/utils"

/** Admin-only text size controls. */
export function AdminAppearance({ embedded = false }: { embedded?: boolean }) {
  const { fontSize, setFontSize } = useAdminPrefs()
  const fontIndex = FONT_SIZE_ORDER.indexOf(fontSize)

  const content = (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-foreground flex items-center gap-1.5 text-sm font-medium">
            <Type className="h-4 w-4" strokeWidth={1.75} />
            Text size
          </p>
          <p className="text-muted-foreground text-sm">
            Make everything easier to read. Large is recommended.
          </p>
        </div>
        <span className="text-foreground text-sm font-semibold">
          {FONT_SIZE_LABELS[fontSize]}
        </span>
      </div>

      <div className="mt-4">
        <Slider
          min={0}
          max={2}
          step={1}
          value={[fontIndex]}
          onValueChange={(sliderValue) => {
            const fontSizeIndex = Array.isArray(sliderValue)
              ? (sliderValue[0] ?? 0)
              : sliderValue
            setFontSize(
              (FONT_SIZE_ORDER[fontSizeIndex] ?? "normal") as AdminFontSize,
            )
          }}
        />
        <div className="text-muted-foreground mt-2 flex justify-between text-xs">
          {FONT_SIZE_ORDER.map((fontSizeOption) => (
            <Button
              key={fontSizeOption}
              variant="ghost"
              size="xs"
              onClick={() => setFontSize(fontSizeOption)}
              className={cn(
                fontSizeOption === fontSize
                  ? "text-foreground font-semibold"
                  : undefined,
              )}
            >
              {FONT_SIZE_LABELS[fontSizeOption]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  if (embedded) return content

  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <h2 className="text-foreground text-sm font-semibold">Appearance</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Adjust text size for the admin panel.
      </p>
      <div className="mt-5">{content}</div>
    </section>
  )
}
