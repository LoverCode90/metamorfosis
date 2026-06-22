"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"

export type AdminTheme = "dark" | "light"
export type AdminFontSize = "normal" | "large" | "larger"

export const FONT_SIZE_ORDER: AdminFontSize[] = ["normal", "large", "larger"]
export const FONT_SIZE_LABELS: Record<AdminFontSize, string> = {
  normal: "Normal",
  large: "Large",
  larger: "Larger",
}

const THEME_KEY = "admin-theme"
const FONT_KEY = "admin-font-size"

interface AdminPrefs {
  theme: AdminTheme
  fontSize: AdminFontSize
  setTheme: (t: AdminTheme) => void
  setFontSize: (f: AdminFontSize) => void
}

const AdminPrefsContext = createContext<AdminPrefs | null>(null)

export function useAdminPrefs(): AdminPrefs {
  const ctx = useContext(AdminPrefsContext)
  if (!ctx) throw new Error("useAdminPrefs must be used within AdminShell")
  return ctx
}

/**
 * Wraps the entire admin section. Owns the admin-only theme + font-size
 * preferences (persisted to localStorage), and exposes them via context.
 * The preferences are applied as data attributes on the wrapper div, which
 * CSS scopes so they never leak into the always-dark store.
 */
function readTheme(): AdminTheme {
  if (typeof window === "undefined") return "dark"
  const stored = localStorage.getItem(THEME_KEY)
  return stored === "light" || stored === "dark" ? stored : "dark"
}

function readFontSize(): AdminFontSize {
  if (typeof window === "undefined") return "normal"
  const stored = localStorage.getItem(FONT_KEY)
  return stored === "normal" || stored === "large" || stored === "larger"
    ? stored
    : "normal"
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>(readTheme)
  const [fontSize, setFontSizeState] = useState<AdminFontSize>(readFontSize)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.dataset.adminTheme = theme
  }, [theme, mounted])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.dataset.adminFontSize = fontSize
  }, [fontSize, mounted])

  function setTheme(t: AdminTheme) {
    setThemeState(t)
    localStorage.setItem(THEME_KEY, t)
    document.documentElement.dataset.adminTheme = t
  }

  function setFontSize(f: AdminFontSize) {
    setFontSizeState(f)
    localStorage.setItem(FONT_KEY, f)
    document.documentElement.dataset.adminFontSize = f
  }

  return (
    <AdminPrefsContext.Provider
      value={{ theme, fontSize, setTheme, setFontSize }}
    >
      <div
        suppressHydrationWarning
        data-admin-theme={theme}
        data-font-size={fontSize}
        className="bg-background text-foreground min-h-screen"
      >
        {children}
      </div>
    </AdminPrefsContext.Provider>
  )
}
