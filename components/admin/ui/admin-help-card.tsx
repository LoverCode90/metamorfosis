import type { ReactNode } from "react"

interface AdminHelpCardProps {
  title: string
  steps: ReactNode[]
  note?: string
}

/** Numbered step-by-step guide for non-technical admin users. */
export function AdminHelpCard({ title, steps, note }: AdminHelpCardProps) {
  return (
    <section className="border-primary/25 bg-primary/5 rounded-2xl border p-5 md:p-6">
      <h2 className="text-foreground text-lg font-semibold">{title}</h2>
      <ol className="text-foreground mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed">
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
      {note && (
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          {note}
        </p>
      )}
    </section>
  )
}
