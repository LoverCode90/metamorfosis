/** A single dot + label/date entry on the case timeline. */
function TimelineEvent({ title, date }: { title: string; date: string }) {
  return (
    <div className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
      <div className="border-foreground bg-background flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
      <div className="ml-4 w-[calc(100%-2rem)] md:ml-0 md:w-[calc(50%-1.5rem)] md:group-odd:text-right">
        <p className="text-foreground text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{date}</p>
      </div>
    </div>
  )
}

interface CaseTimelineProps {
  createdAt: string
  resolvedAt: string | null
}

/** Vertical case timeline: opened and (when present) resolved milestones. */
export function CaseTimeline({ createdAt, resolvedAt }: CaseTimelineProps) {
  return (
    <section className="border-border bg-card rounded-2xl border p-6">
      <h2 className="text-foreground mb-4 text-sm font-semibold">Timeline</h2>
      <div className="before:via-border relative space-y-6 before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:to-transparent md:before:mx-auto md:before:translate-x-0">
        <TimelineEvent
          title="Case Opened"
          date={new Date(createdAt).toLocaleDateString()}
        />
        {resolvedAt && (
          <TimelineEvent
            title="Case Resolved"
            date={new Date(resolvedAt).toLocaleDateString()}
          />
        )}
      </div>
    </section>
  )
}
