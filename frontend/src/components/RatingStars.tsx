import { Star } from "lucide-react"
import { cn } from "../lib/utils"

export function RatingStars({
  value,
  onChange,
  label,
}: {
  value: number
  onChange?: (v: number) => void
  label?: string
}) {
  const readOnly = !onChange
  return (
    <div className="inline-flex items-center gap-1" aria-label={label || "Rating"}>
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1
        const active = n <= value
        return (
          <button
            key={n}
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-2xl border transition",
              active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
              readOnly ? "cursor-default opacity-80" : "hover:bg-accent",
            )}
            aria-label={`Rate ${n}`}
            onClick={() => onChange?.(n)}
            disabled={readOnly}
          >
            <Star className={cn("h-4 w-4", active ? "" : "opacity-60")} />
          </button>
        )
      })}
    </div>
  )
}
