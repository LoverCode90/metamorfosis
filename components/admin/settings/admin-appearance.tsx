"use client"

import { Moon, Sun, Type } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  FONT_SIZE_LABELS,
  FONT_SIZE_ORDER,
  useAdminPrefs,
  type AdminFontSize,
} from "@/components/admin/admin-shell"
import { cn } from "@/lib/utils"

/** Admin-only appearance controls: theme toggle and base font-size slider. */
export function AdminAppearance() {
  const { theme, setTheme, fontSize, setFontSize } = useAdminPrefs()
  const fontIndex = FONT_SIZE_ORDER.indexOf(fontSize)

  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <h2 className="text-foreground text-sm font-semibold">Appearance</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        These preferences only affect the admin section. The store always uses
        the dark theme.
      </p>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-foreground text-sm font-medium">Theme</p>
          <p className="text-muted-foreground text-xs">
            Choose how the admin section looks.
          </p>
        </div>
        <div className="border-border bg-background inline-flex gap-1 rounded-lg border p-1">
          <Button
            variant={theme === "dark" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
          >
            <Moon className="h-4 w-4" strokeWidth={1.75} />
            Dark
          </Button>
          <Button
            variant={theme === "light" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTheme("light")}
            aria-pressed={theme === "light"}
          >
            <Sun className="h-4 w-4" strokeWidth={1.75} />
            Light
          </Button>
        </div>
      </div>

      <div className="border-border mt-6 border-t pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-foreground flex items-center gap-1.5 text-sm font-medium">
              <Type className="h-4 w-4" strokeWidth={1.75} />
              Text size
            </p>
            <p className="text-muted-foreground text-xs">
              Adjust the base font size for the admin section.
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
            onValueChange={(v) => {
              const idx = Array.isArray(v) ? (v[0] ?? 0) : v
              setFontSize((FONT_SIZE_ORDER[idx] ?? "normal") as AdminFontSize)
            }}
          />
          <div className="text-muted-foreground mt-2 flex justify-between text-xs">
            {FONT_SIZE_ORDER.map((f) => (
              <Button
                key={f}
                variant="ghost"
                size="xs"
                onClick={() => setFontSize(f)}
                className={cn(
                  f === fontSize ? "text-foreground font-semibold" : undefined,
                )}
              >
                {FONT_SIZE_LABELS[f]}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
