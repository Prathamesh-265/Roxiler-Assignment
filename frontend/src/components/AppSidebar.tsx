import { NavLink } from "react-router-dom"
import { cn } from "../lib/utils"

export type NavItem = { to: string; label: string; icon?: React.ReactNode }

export function AppSidebar({ items }: { items: NavItem[] }) {
  return (
    <aside className="overflow-hidden rounded-2xl border glass shadow-soft">
      {/* Header */}
      <div className="border-b bg-secondary/20 px-5 py-4">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </p>
      </div>

      
      <nav className="p-3 space-y-2">
        {items.map((it) => {
          const isBaseDashboardRoute =
            it.to === "/admin" || it.to === "/user" || it.to === "/owner"

          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={isBaseDashboardRoute}
              className={({ isActive }) =>
                cn(
                  
                  "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold",
                  "transition-colors duration-200",
                  "hover:bg-secondary/40",
                  isActive ? "bg-white/70 text-foreground" : "text-muted-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* active indicator */}
                  <span
                    className={cn(
                      "absolute left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full transition-opacity",
                      isActive ? "opacity-100 bg-primary" : "opacity-0",
                    )}
                  />

                  {/* icon */}
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-2xl border bg-card/60",
                      "transition-colors duration-200",
                      isActive ? "text-primary border-primary/20" : "text-muted-foreground border-border",
                    )}
                  >
                    {it.icon}
                  </span>

                  {/* label */}
                  <span className={cn(isActive ? "font-extrabold text-foreground" : "")}>
                    {it.label}
                  </span>

                  {/* subtle active glow */}
                  {isActive ? (
                    <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent" />
                  ) : null}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
