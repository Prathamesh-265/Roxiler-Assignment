import { LayoutDashboard, Store, Users } from "lucide-react"
import { AppShell } from "../components/AppShell"

export function AdminLayout() {
  return (
    <AppShell
      nav={[
        { to: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/admin/stores", label: "Store Management", icon: <Store className="h-4 w-4" /> },
        { to: "/admin/users", label: "User Management", icon: <Users className="h-4 w-4" /> },
      ]}
    />
  )
}
