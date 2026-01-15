import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"

export function NotFoundPage() {
  return (
    <div className="container flex min-h-dvh items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-black">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <Button asChild className="mt-6">
          <Link to="/login">Go to Login</Link>
        </Button>
      </div>
    </div>
  )
}
