"use client"

import { useRef } from "react"

interface OtpInputGroupProps {
  value: string[]
  onChange: (value: string[]) => void
}

/**
 * Controlled multi-box numeric OTP input. Auto-advances on entry, moves back
 * on backspace, and supports pasting the full code. Owns its input refs so the
 * parent only deals with the code array.
 */
export function OtpInputGroup({ value, onChange }: OtpInputGroupProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  function handleDigit(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1)
    const next = [...value]
    next[index] = digit
    onChange(next)
    if (digit && index < value.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, value.length)
    if (pasted.length === value.length) {
      onChange(pasted.split(""))
      inputRefs.current[value.length - 1]?.focus()
    }
    e.preventDefault()
  }

  return (
    <div className="flex justify-center gap-3" onPaste={handlePaste}>
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleDigit(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="border-border bg-background text-foreground focus:border-foreground h-14 w-14 rounded-xl border text-center text-2xl font-semibold transition-colors outline-none"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
