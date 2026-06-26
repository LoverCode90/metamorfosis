"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

interface FilterSearchProps {
  value: string
  onChange: (value: string) => void
}

/** Catalog search input with a leading search icon. */
export function FilterSearch({ value, onChange }: FilterSearchProps) {
  return (
    <label className="relative block">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        strokeWidth={1.75}
      />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products"
        className="pl-9"
      />
    </label>
  )
}
