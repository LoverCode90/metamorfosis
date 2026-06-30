"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

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
  const context = useContext(AdminPrefsContext)
  if (!context) throw new Error("useAdminPrefs must be used within AdminShell")
  return context
}

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

/**
 * Wraps the admin section. Theme and font size persist in localStorage across
 * refresh and sign-out.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>("dark")
  const [fontSize, setFontSizeState] = useState<AdminFontSize>("normal")

  useEffect(() => {
    const storedTheme = readTheme()
    const storedFontSize = readFontSize()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(storedTheme)
    setFontSizeState(storedFontSize)
    document.documentElement.dataset.adminTheme = storedTheme
    document.documentElement.dataset.adminFontSize = storedFontSize
    document.documentElement.classList.toggle("dark", storedTheme === "dark")
  }, [])

  function setTheme(nextTheme: AdminTheme) {
    setThemeState(nextTheme)
    localStorage.setItem(THEME_KEY, nextTheme)
    document.documentElement.dataset.adminTheme = nextTheme
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
  }

  function setFontSize(nextFontSize: AdminFontSize) {
    setFontSizeState(nextFontSize)
    localStorage.setItem(FONT_KEY, nextFontSize)
    document.documentElement.dataset.adminFontSize = nextFontSize
  }

  return (
    <AdminPrefsContext.Provider
      value={{ theme, fontSize, setTheme, setFontSize }}
    >
      <div
        suppressHydrationWarning
        data-admin-theme={theme}
        data-font-size={fontSize}
        className={cn(
          "bg-background text-foreground min-h-screen",
          theme === "dark" && "dark",
        )}
      >
        {children}
      </div>
    </AdminPrefsContext.Provider>
  )
}
