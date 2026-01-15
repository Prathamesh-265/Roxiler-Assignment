import { Link, useNavigate } from "react-router-dom"
import { LogOut, Shield, Store, User } from "lucide-react"
import { Button } from "./ui/button"
import { useAuth } from "../state/auth"

function RoleBadge({ role }: { role: string }) {
  const meta: Record<string, { icon: React.ReactNode; label: string }> = {
    admin: { icon: <Shield className="h-4 w-4" />, label: "Admin" },
    user: { icon: <User className="h-4 w-4" />, label: "User" },
    owner: { icon: <Store className="h-4 w-4" />, label: "Store Owner" },
  }
  const r = meta[role] || { icon: null, label: role }

  return (
    <span className="inline-flex items-center gap-2 rounded-2xl border bg-white/60 px-3 py-1 text-xs font-extrabold text-foreground shadow-soft">
      {r.icon} {r.label}
    </span>
  )
}

export function AppTopbar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  return (
    <header className="sticky top-0 z-50 border-b glass shadow-soft">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link
          to={user ? `/${user.role}` : "/login"}
          className="flex items-center gap-2 text-lg font-black tracking-tight transition-opacity hover:opacity-90"
        >
          <span className="gradient-text">Roxiler</span>
          <span>Ratings</span>
        </Link>

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-3">
            <RoleBadge role={user.role} />

            <span className="hidden max-w-[220px] truncate text-sm font-semibold text-muted-foreground md:block">
              {user.email}
            </span>

            <div className="hidden h-6 w-px bg-border md:block" />

            <Button
              variant="outline"
              size="icon"
              aria-label="Logout"
              className="rounded-2xl"
              onClick={() => {
                logout()
                nav("/login")
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
