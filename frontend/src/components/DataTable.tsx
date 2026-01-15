import { ChevronDown, ChevronUp, SearchX } from "lucide-react"
import { cn } from "../lib/utils"

export type Column<T> = {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  sort,
  onSort,
  emptyText = "No data found.",
}: {
  columns: Column<T>[]
  rows: T[]
  sort?: { key: keyof T; dir: "asc" | "desc" }
  onSort?: (key: keyof T) => void
  emptyText?: string
}) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border bg-card/75 shadow-soft backdrop-blur">
      <table className="min-w-[780px] w-full text-sm">
        {/* Header */}
        <thead className="sticky top-0 z-10 bg-secondary/35 backdrop-blur">
          <tr className="border-b">
            {columns.map((c) => {
              const active = sort?.key === c.key
              const dir = active ? sort?.dir : undefined

              return (
                <th
                  key={String(c.key)}
                  className={cn(
                    "px-5 py-4 text-left text-xs font-medium tracking-wide text-muted-foreground",
                    c.className,
                  )}
                >
                  {c.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(c.key)}
                      aria-label={`Sort by ${c.header}`}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-2 py-1",
                        "transition-colors duration-200",
                        "hover:bg-secondary/50 hover:text-foreground",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <span className="font-medium">{c.header}</span>

                      {active ? (
                        dir === "asc" ? (
                          <ChevronUp className="h-4 w-4 opacity-80" />
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-80" />
                        )
                      ) : (
                        <ChevronDown className="h-4 w-4 opacity-30" />
                      )}
                    </button>
                  ) : (
                    <span className="font-medium">{c.header}</span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-16">
                <div className="mx-auto flex max-w-md flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-secondary/40">
                    <SearchX className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">{emptyText}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try changing filters or search keywords.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr
                key={idx}
                className={cn(
                  "border-b last:border-b-0",
                  "transition-colors duration-200",
                  "hover:bg-secondary/20",
                )}
              >
                {columns.map((c) => (
                  <td
                    key={String(c.key)}
                    className={cn("px-5 py-4 align-middle text-sm text-foreground/90", c.className)}
                  >
                    {c.render ? c.render(r) : String(r[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
