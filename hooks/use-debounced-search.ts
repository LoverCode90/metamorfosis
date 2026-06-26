"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

/**
 * Two-way debounced text state for a search input. Mirrors an external value
 * (so external resets like "Clear all" flow inward) while committing local
 * edits to `onCommit` after `delayMs`. Always commits the latest `onCommit`
 * closure, so callers can pass a fresh callback each render.
 * @param external - The source-of-truth value owned by the parent.
 * @param onCommit - Called with the debounced local value.
 * @param delayMs - Debounce delay in milliseconds.
 * @returns `[value, setValue]` to bind to the input.
 */
export function useDebouncedSearch(
  external: string,
  onCommit: (value: string) => void,
  delayMs = 400,
): readonly [string, (value: string) => void] {
  const [local, setLocal] = useState(external)

  // Detect external resets and sync inward during render (derived state).
  const [shadow, setShadow] = useState(external)
  if (external !== shadow) {
    setShadow(external)
    setLocal(external)
  }

  // Keep the latest commit callback without retriggering the debounce.
  const onCommitRef = useRef(onCommit)
  useLayoutEffect(() => {
    onCommitRef.current = onCommit
  })

  useEffect(() => {
    const t = setTimeout(() => onCommitRef.current(local), delayMs)
    return () => clearTimeout(t)
  }, [local, delayMs])

  return [local, setLocal] as const
}
