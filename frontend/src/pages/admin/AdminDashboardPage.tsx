import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { Store, Star, Users, ArrowUpRight, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

type Totals = { users: number; stores: number; ratings: number }

function StatCard({
  title,
  value,
  icon,
  hint,
  href,
  accent = "from-blue-500/15 via-indigo-500/10 to-emerald-500/10",
}: {
  title: string
  value: number
  icon: React.ReactNode
  hint: string
  href?: string
  accent?: string
}) {
  const Wrap = href ? Link : ("div" as any)

  return (
    <Wrap
      to={href}
      className={[
        "group relative overflow-hidden rounded-2xl border bg-card/70 p-5 shadow-soft",
        "transition-colors duration-200",
        "hover:bg-card/90 hover:border-primary/25",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
      ].join(" ")}
    >
      {/* subtle gradient overlay */}
      <div className={["pointer-events-none absolute inset-0 opacity-70", "bg-gradient-to-br", accent].join(" ")} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">{title}</p>
          <p className="text-4xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>

        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-white/70 text-foreground">
            {icon}
          </div>

          {href ? (
            <div className="absolute -right-1 -top-1 rounded-xl border bg-white/80 p-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          ) : null}
        </div>
      </div>
    </Wrap>
  )
}

export function AdminDashboardPage() {
  const [data, setData] = useState<Totals | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get("/api/admin/dashboard")
        setData(res.data)
      } catch (e: any) {
        setData({ users: 0, stores: 0, ratings: 0 })
        toast.message("Backend not connected. Showing empty dashboard.")
      }
    })()
  }, [])

  const stats = useMemo(() => {
    return [
      {
        title: "Total Users",
        value: data?.users ?? 0,
        icon: <Users className="h-5 w-5" />,
        hint: "All registered users on platform",
        href: "/admin/users",
        accent: "from-blue-500/10 via-indigo-500/10 to-emerald-500/5",
      },
      {
        title: "Total Stores",
        value: data?.stores ?? 0,
        icon: <Store className="h-5 w-5" />,
        hint: "Active registered stores",
        href: "/admin/stores",
        accent: "from-emerald-500/10 via-teal-500/8 to-blue-500/6",
      },
      {
        title: "Total Ratings",
        value: data?.ratings ?? 0,
        icon: <Star className="h-5 w-5" />,
        hint: "Ratings submitted by users",
        accent: "from-indigo-500/10 via-purple-500/8 to-pink-500/6",
      },
    ]
  }, [data])

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">ADMIN</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform overview • {today}</p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border bg-card/70 px-4 py-2 shadow-soft">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="text-xs font-medium text-muted-foreground">
            You have full access to manage stores and users
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={s.icon}
            hint={s.hint}
            href={s.href}
            accent={s.accent}
          />
        ))}
      </div>

      {/* Quick actions */}
      <Card className="overflow-hidden">
        <div className="border-b bg-secondary/30 px-6 py-4">
          <p className="text-sm font-semibold tracking-tight text-foreground">Quick Actions</p>
          <p className="text-xs text-muted-foreground">Manage core resources quickly</p>
        </div>

        <CardContent className="grid gap-3 p-6 md:grid-cols-2">
          <Link
            to="/admin/stores"
            className={[
              "rounded-2xl border bg-card/70 p-4 shadow-soft",
              "transition-colors duration-200",
              "hover:bg-card/90 hover:border-primary/25",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-foreground">Manage Stores</p>
            <p className="mt-1 text-xs text-muted-foreground">View stores, ratings and sort/filter records.</p>
          </Link>

          <Link
            to="/admin/users"
            className={[
              "rounded-2xl border bg-card/70 p-4 shadow-soft",
              "transition-colors duration-200",
              "hover:bg-card/90 hover:border-primary/25",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-foreground">Manage Users</p>
            <p className="mt-1 text-xs text-muted-foreground">Add users/admins and view user details.</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
