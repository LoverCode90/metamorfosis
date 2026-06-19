"use client"

import Turnstile from "react-turnstile"

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

/**
 * Cloudflare Turnstile bot-mitigation widget.
 * Renders a challenge on signup. If the site key is not configured the widget
 * is omitted silently so local development works without Turnstile keys.
 */
export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!siteKey) return null

  return (
    <Turnstile
      sitekey={siteKey}
      onVerify={onVerify}
      onExpire={onExpire}
      theme="dark"
      size="normal"
    />
  )
}
