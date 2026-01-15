import { Navigate } from "react-router-dom"
import { useAuth, type UserRole } from "../state/auth"

export function ProtectedRoute({
  role,
  children,
}: {
  role: UserRole
  children: React.ReactNode
}) {
  const { token, user } = useAuth()

  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />
  return <>{children}</>
}
