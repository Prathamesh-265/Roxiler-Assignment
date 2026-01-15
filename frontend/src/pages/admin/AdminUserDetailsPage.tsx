import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Card, CardContent } from "../../components/ui/card"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { formatRating } from "../../lib/utils"
import { ArrowLeft, Mail, MapPin, Shield, User, Store } from "lucide-react"
import { Button } from "../../components/ui/button"

type UserDetails = {
  id: number
  name: string
  email: string
  address: string
  role: "admin" | "user" | "owner"
  rating?: number | null
}

function RoleChip({ role }: { role: UserDetails["role"] }) {
  const meta: Record<UserDetails["role"], { label: string; icon: React.ReactNode }> = {
    admin: { label: "Admin", icon: <Shield className="h-4 w-4" /> },
    user: { label: "User", icon: <User className="h-4 w-4" /> },
    owner: { label: "Store Owner", icon: <Store className="h-4 w-4" /> },
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-2xl border bg-card/80 px-3 py-1 text-xs font-semibold text-foreground shadow-soft">
      {meta[role].icon}
      {meta[role].label}
    </span>
  )
}

function Field({
  label,
  icon,
  value,
}: {
  label: string
  icon?: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-card/70 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-start gap-2">
        {icon ? <span className="mt-0.5 text-muted-foreground">{icon}</span> : null}
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function AdminUserDetailsPage() {
  const { id } = useParams()
  const [data, setData] = useState<UserDetails | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get(`/api/admin/users/${id}`)
        setData(res.data)
      } catch (e: any) {
        setData(null)
        toast.error("Unable to fetch user details (backend not connected).")
      }
    })()
  }, [id])

  const title = useMemo(() => {
    return data?.name ? data.name : "User Details"
  }, [data?.name])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <Button asChild variant="outline" size="sm" className="rounded-2xl">
            <Link to="/admin/users" aria-label="Back to users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>

          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground">ADMIN</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View full details. If owner, store average rating is shown.
            </p>
          </div>
        </div>

        {data?.role ? <RoleChip role={data.role} /> : null}
      </div>

      {/* Profile grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main info */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="border-b bg-secondary/30 px-6 py-4">
            <p className="text-sm font-semibold tracking-tight text-foreground">Profile</p>
            <p className="text-xs text-muted-foreground">User information</p>
          </div>

          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <Field label="Name" value={data?.name || "-"} />
            <Field label="Role" value={data?.role || "-"} />

            <Field label="Email" icon={<Mail className="h-4 w-4" />} value={data?.email || "-"} />

            <Field label="Address" icon={<MapPin className="h-4 w-4" />} value={data?.address || "-"} />
          </CardContent>
        </Card>

        {/* Side info */}
        <Card className="overflow-hidden">
          <div className="border-b bg-secondary/30 px-6 py-4">
            <p className="text-sm font-semibold tracking-tight text-foreground">Insights</p>
            <p className="text-xs text-muted-foreground">Summary</p>
          </div>

          <CardContent className="space-y-4 p-6">
            <div className="rounded-2xl border bg-card/70 p-4">
              <p className="text-xs font-medium text-muted-foreground">User ID</p>
              <p className="mt-1 text-sm font-semibold text-foreground">#{data?.id ?? "-"}</p>
            </div>

            <div className="rounded-2xl border bg-card/70 p-4">
              <p className="text-xs font-medium text-muted-foreground">Store Rating</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                {data?.role === "owner" ? formatRating(data?.rating ?? null) : "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {data?.role === "owner"
                  ? "Average rating of owner's store"
                  : "Only store owners have ratings"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
