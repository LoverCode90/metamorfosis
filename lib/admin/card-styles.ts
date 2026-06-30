/** Shared Tailwind classes for server-rendered admin cards (no client JS). */
export const ADMIN_SERVER_CARD_CLASS =
  "relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_8px_40px_-12px_rgba(0,0,0,0.45)] backdrop-blur-sm before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:via-transparent before:to-transparent"

export const ADMIN_TABLE_SHELL_CLASS =
  "overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_12px_48px_-16px_rgba(0,0,0,0.5)] backdrop-blur-sm"

export const ADMIN_TABLE_HEAD_CLASS =
  "bg-muted/30 text-muted-foreground text-[11px] font-semibold tracking-wider uppercase"

export const ADMIN_PRIMARY_BUTTON_CLASS =
  "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-4px_var(--primary)]"
