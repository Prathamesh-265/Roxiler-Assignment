import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { DataTable, type Column } from "../../components/DataTable"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Search, Users } from "lucide-react"

type Role = "admin" | "user" | "owner"
type UserRow = { id: number; name: string; email: string; address: string; role: Role }

export function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([])
  const [q, setQ] = useState("")
  const [role, setRole] = useState<Role | "all">("all")
  const [sort, setSort] = useState<{ key: keyof UserRow; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  })

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get("/api/admin/users")
        setRows(res.data)
      } catch (e: any) {
        setRows([])
        toast.message("Backend not connected. Users list empty.")
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()

    const x = rows
      .filter((r) => (role === "all" ? true : r.role === role))
      .filter((r) =>
        query ? [r.name, r.email, r.address, r.role].some((v) => v.toLowerCase().includes(query)) : true,
      )

    const dir = sort.dir === "asc" ? 1 : -1
    return [...x].sort((a, b) => String(a[sort.key]).localeCompare(String(b[sort.key])) * dir)
  }, [rows, q, role, sort])

  const columns: Column<UserRow>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "address", header: "Address", sortable: true, className: "max-w-[360px]" },
    { key: "role", header: "Role", sortable: true },
    {
      key: "id",
      header: "Action",
      render: (u) => (
        <Button asChild variant="outline" size="sm" aria-label={`View user ${u.name}`}>
          <Link to={`/admin/users/${u.id}`}>View</Link>
        </Button>
      ),
    },
  ]

  const onSort = (key: keyof UserRow) => {
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
            <Users className="h-6 w-6 text-primary" />
            Users
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Filter by name/email/address/role • Sorting enabled
          </p>
        </div>

        <div className="rounded-2xl border bg-card/75 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
          <span className="font-semibold text-foreground">{rows.length}</span> users
        </div>
      </div>

      {/* Toolbar */}
      <Card className="overflow-hidden">
        <div className="border-b bg-secondary/30 px-6 py-4">
          <p className="text-sm font-semibold tracking-tight text-foreground">Search & Filter</p>
          <p className="text-xs text-muted-foreground">Search across name, email, address, and role</p>
        </div>

        <CardContent className="grid gap-3 p-6 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search users"
              placeholder="Search users..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            aria-label="Role filter"
            className="h-11 rounded-2xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="owner">Store Owner</option>
          </select>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={filtered}
        sort={sort}
        onSort={onSort}
        emptyText="No users available."
      />
    </div>
  )
}
