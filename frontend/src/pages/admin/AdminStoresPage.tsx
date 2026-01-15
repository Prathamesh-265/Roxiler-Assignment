import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { DataTable, type Column } from "../../components/DataTable"
import { api } from "../../lib/api"
import { formatRating } from "../../lib/utils"
import { toast } from "sonner"
import { Search, Store } from "lucide-react"

type StoreRow = { id: number; name: string; email: string; address: string; rating: number | null }

export function AdminStoresPage() {
  const [rows, setRows] = useState<StoreRow[]>([])
  const [q, setQ] = useState("")
  const [sort, setSort] = useState<{ key: keyof StoreRow; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  })

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get("/api/admin/stores")
        setRows(res.data)
      } catch (e: any) {
        setRows([])
        toast.message("Backend not connected. Stores list empty.")
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()

    const x = query
      ? rows.filter((r) => [r.name, r.email, r.address].some((v) => v.toLowerCase().includes(query)))
      : rows

    const dir = sort.dir === "asc" ? 1 : -1

    return [...x].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir
    })
  }, [rows, q, sort])

  const columns: Column<StoreRow>[] = [
    { key: "name", header: "Store Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "address", header: "Address", sortable: true, className: "max-w-[360px]" },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (r) => <span className="font-semibold">{formatRating(r.rating)}</span>,
    },
  ]

  const onSort = (key: keyof StoreRow) => {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">ADMIN</p>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground">
            <Store className="h-6 w-6 text-primary" />
            Stores
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, sort and view registered stores.
          </p>
        </div>

        <div className="rounded-2xl border bg-card/75 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
          <span className="font-semibold text-foreground">{rows.length}</span> stores
        </div>
      </div>

      {/* Toolbar */}
      <Card className="overflow-hidden">
        <div className="border-b bg-secondary/30 px-6 py-4">
          <p className="text-sm font-semibold tracking-tight text-foreground">Search</p>
          <p className="text-xs text-muted-foreground">Search by name, email or address</p>
        </div>

        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search stores"
              placeholder="Search stores..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={filtered}
        sort={sort}
        onSort={onSort}
        emptyText="No stores available."
      />
    </div>
  )
}
