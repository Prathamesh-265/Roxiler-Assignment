import { KeyRound, Store } from "lucide-react"
import { AppShell } from "../components/AppShell"

export function UserLayout() {
  return (
    <AppShell
      nav={[
        { to: "/user/stores", label: "Stores", icon: <Store className="h-4 w-4" /> },
        { to: "/user/update-password", label: "Security", icon: <KeyRound className="h-4 w-4" /> },
      ]}
    />
  )
}
