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
export function AdminAppearance({ embedded = false }: { embedded?: boolean }) {
  const { theme, setTheme, fontSize, setFontSize } = useAdminPrefs()
  const fontIndex = FONT_SIZE_ORDER.indexOf(fontSize)

  const content = (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            className={theme === "dark" ? "bg-primary hover:bg-primary/90" : ""}
            onClick={() => setTheme("dark")}
            aria-pressed={theme === "dark"}
          >
            <Moon className="h-4 w-4" strokeWidth={1.75} />
            Dark
          </Button>
          <Button
            variant={theme === "light" ? "default" : "ghost"}
            size="sm"
            className={
              theme === "light" ? "bg-primary hover:bg-primary/90" : ""
            }
            onClick={() => setTheme("light")}
            aria-pressed={theme === "light"}
          >
            <Sun className="h-4 w-4" strokeWidth={1.75} />
            Light
          </Button>
        </div>
      </div>

      <div className="border-border border-border/50 mt-6 border-t pt-6">
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
    </>
  )

  if (embedded) return content

  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <h2 className="text-foreground text-sm font-semibold">Appearance</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        These preferences only affect the admin section. The store always uses
        the dark theme.
      </p>
      <div className="mt-5">{content}</div>
    </section>
  )
}
