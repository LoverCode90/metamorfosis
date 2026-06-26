interface AboutSectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
}

/** Centered eyebrow + heading (+ optional description) for about-page sections. */
export function AboutSectionHeading({
  eyebrow,
  title,
  description,
}: AboutSectionHeadingProps) {
  return (
    <div className="text-center">
      <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
        {eyebrow}
      </p>
      <h2 className="text-foreground mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
