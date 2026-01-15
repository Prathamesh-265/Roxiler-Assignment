import { Outlet } from "react-router-dom"
import { AppTopbar } from "./AppTopbar"
import { AppSidebar, type NavItem } from "./AppSidebar"
import { PageMotion } from "./Motion"

export function AppShell({ nav }: { nav: NavItem[] }) {
  return (
    <div className="min-h-dvh">
      <AppTopbar />

   
      <div className="container py-6">
        
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <AppSidebar items={nav} />

       
          <main className="min-h-[calc(100vh-140px)]">
            <PageMotion>
              <Outlet />
            </PageMotion>
          </main>
        </div>
      </div>
    </div>
  )
}
