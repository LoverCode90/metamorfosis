"use client"

/**
 * Radial completion ring rendered with a stroked SVG circle.
 * `value` is 0–100. Animates smoothly via CSS transition on the dash offset.
 */
export function CompletionRing({
  value,
  size = 132,
  stroke = 10,
}: {
  value: number
  size?: number
  stroke?: number
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-foreground transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-foreground text-2xl font-semibold tabular-nums">
          {clamped}%
        </span>
        <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
          Complete
        </span>
      </div>
    </div>
  )
}
