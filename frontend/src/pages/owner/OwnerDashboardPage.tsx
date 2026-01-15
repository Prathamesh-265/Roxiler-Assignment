import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { DataTable, type Column } from "../../components/DataTable"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { formatRating } from "../../lib/utils"
import { Star, Users, Store, Search } from "lucide-react"
import { Input } from "../../components/ui/input"

type Rater = { id: number; name: string; email: string; rating: number; created_at: string }
type OwnerDashboard = { averageRating: number | null; raters: Rater[] }

function formatDateTime(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function MetricCard({
  title,
  value,
  hint,
  icon,
  accent,
}: {
  title: string
  value: React.ReactNode
  hint: string
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border bg-card/75 p-6 shadow-soft",
        "transition-colors duration-200 hover:bg-card/95 hover:border-primary/20",
      ].join(" ")}
    >
      <div className={["pointer-events-none absolute inset-0 opacity-70", "bg-gradient-to-br", accent].join(" ")} />

      <div className="relative flex items-start justify-between gap-5">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">{title}</p>
          <div className="text-[40px] leading-[1.1] font-bold tracking-tight text-foreground">{value}</div>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-white/70 text-foreground">
          {icon}
        </div>
      </div>
    </div>
  )
}

export function OwnerDashboardPage() {
  const [data, setData] = useState<OwnerDashboard>({ averageRating: null, raters: [] })
  const [q, setQ] = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get("/api/owner/dashboard")
        setData(res.data)
      } catch (e: any) {
        toast.message("Backend not connected. Showing empty dashboard.")
        setData({ averageRating: null, raters: [] })
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return data.raters
    return data.raters.filter((r) => [r.name, r.email].some((v) => v.toLowerCase().includes(query)))
  }, [data.raters, q])

  const columns: Column<Rater>[] = useMemo(
    () => [
      { key: "name", header: "User", sortable: true },
      { key: "email", header: "Email", sortable: true },
      {
        key: "rating",
        header: "Rating",
        sortable: true,
        render: (r) => <span className="font-semibold">{r.rating}</span>,
      },
      {
        key: "created_at",
        header: "Submitted At",
        sortable: true,
        render: (r) => <span className="text-foreground/80">{formatDateTime(r.created_at)}</span>,
      },
    ],
    [],
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">STORE OWNER</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your store rating and customer feedback
          </p>
        </div>

        <div className="rounded-2xl border bg-card/75 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
          <span className="font-semibold text-foreground">{data.raters.length}</span> submissions
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Average Store Rating"
          value={formatRating(data.averageRating)}
          hint="Computed dynamically from submitted ratings"
          icon={<Star className="h-5 w-5 text-primary" />}
          accent="from-indigo-500/10 via-purple-500/8 to-pink-500/6"
        />

        <MetricCard
          title="Total Raters"
          value={data.raters.length}
          hint="Unique users who submitted ratings"
          icon={<Users className="h-5 w-5 text-primary" />}
          accent="from-emerald-500/10 via-teal-500/8 to-blue-500/6"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {/* section header */}
        <div className="border-b bg-secondary/30 px-6 py-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold tracking-tight text-foreground">Ratings Submitted</p>
            </div>

            {/* search */}
            <div className="relative mt-3 md:mt-0 md:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search raters"
                placeholder="Search raters by name/email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Users who submitted a rating for your store.
          </p>
        </div>

        <CardContent className="p-6">
          <DataTable columns={columns} rows={filtered} emptyText="No ratings submitted yet." />
        </CardContent>
      </Card>
    </div>
  )
}
