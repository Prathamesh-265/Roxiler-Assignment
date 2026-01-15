import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh">
      <div className="container grid min-h-dvh items-center gap-8 py-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="rounded-2xl border glass shadow-soft p-10">
            <p className="text-xs font-bold tracking-wider text-muted-foreground">ROXILER ASSIGNMENT</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">
              <span className="gradient-text">Premium</span> Store Ratings Platform
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Role-based dashboards • Sorting & filters • Secure auth • Rating system
            </p>
            <div className="mt-8 grid gap-3 text-sm">
              <div className="rounded-2xl bg-card p-4 shadow-soft">✨ Modern dashboards for Admin/User/Owner</div>
              <div className="rounded-2xl bg-card p-4 shadow-soft">⚡ Smooth transitions + micro-interactions</div>
              <div className="rounded-2xl bg-card p-4 shadow-soft">✅ Accessible forms with validations</div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center">
        
          <Link to="/login" className="mx-auto mb-6 flex w-fit items-center gap-2 font-extrabold">
            Roxiler Ratings
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  )
}
