"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

export type AdminFontSize = "normal" | "large" | "larger"

export const FONT_SIZE_ORDER: AdminFontSize[] = ["normal", "large", "larger"]
export const FONT_SIZE_LABELS: Record<AdminFontSize, string> = {
  normal: "Normal",
  large: "Large",
  larger: "Larger",
}

const FONT_KEY = "admin-font-size"

interface AdminPrefs {
  fontSize: AdminFontSize
  setFontSize: (f: AdminFontSize) => void
}

const AdminPrefsContext = createContext<AdminPrefs | null>(null)

export function useAdminPrefs(): AdminPrefs {
  const context = useContext(AdminPrefsContext)
  if (!context) throw new Error("useAdminPrefs must be used within AdminShell")
  return context
}

function readFontSize(): AdminFontSize {
  if (typeof window === "undefined") return "normal"
  const stored = localStorage.getItem(FONT_KEY)
  return stored === "normal" || stored === "large" || stored === "larger"
    ? stored
    : "normal"
}

/** Admin section wrapper — always dark mode; font size persists in localStorage. */
export function AdminShell({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<AdminFontSize>("normal")

  useEffect(() => {
    const storedFontSize = readFontSize()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFontSizeState(storedFontSize)
    document.documentElement.dataset.adminTheme = "dark"
    document.documentElement.dataset.adminFontSize = storedFontSize
    localStorage.setItem("admin-theme", "dark")
    localStorage.removeItem("admin-theme-light")
  }, [])

  function setFontSize(nextFontSize: AdminFontSize) {
    setFontSizeState(nextFontSize)
    localStorage.setItem(FONT_KEY, nextFontSize)
    document.documentElement.dataset.adminFontSize = nextFontSize
  }

  return (
    <AdminPrefsContext.Provider value={{ fontSize, setFontSize }}>
      <div
        suppressHydrationWarning
        data-admin-theme="dark"
        data-font-size={fontSize}
        className={cn("dark bg-background text-foreground min-h-screen")}
      >
        {children}
      </div>
    </AdminPrefsContext.Provider>
  )
}
