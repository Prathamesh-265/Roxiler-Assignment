import { KeyRound, LayoutDashboard } from "lucide-react"
import { AppShell } from "../components/AppShell"

export function OwnerLayout() {
  return (
    <AppShell
      nav={[
        { to: "/owner", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/owner/update-password", label: "Security", icon: <KeyRound className="h-4 w-4" /> },
      ]}
    />
  )
}
