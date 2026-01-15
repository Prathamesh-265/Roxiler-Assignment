import { Navigate, Route, Routes } from "react-router-dom"
import { LoginPage } from "./pages/auth/LoginPage"
import { SignupPage } from "./pages/auth/SignupPage"
import { ProtectedRoute } from "./routes/ProtectedRoute"
import { AdminLayout } from "./layouts/AdminLayout"
import { UserLayout } from "./layouts/UserLayout"
import { OwnerLayout } from "./layouts/OwnerLayout"
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage"
import { AdminStoresPage } from "./pages/admin/AdminStoresPage"
import { AdminUsersPage } from "./pages/admin/AdminUsersPage"
import { AdminUserDetailsPage } from "./pages/admin/AdminUserDetailsPage"
import { UserStoresPage } from "./pages/user/UserStoresPage"
import { UpdatePasswordPage } from "./pages/shared/UpdatePasswordPage"
import { OwnerDashboardPage } from "./pages/owner/OwnerDashboardPage"
import { NotFoundPage } from "./pages/shared/NotFoundPage"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="stores" element={<AdminStoresPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUserDetailsPage />} />
      </Route>

      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/stores" replace />} />
        <Route path="stores" element={<UserStoresPage />} />
        <Route path="update-password" element={<UpdatePasswordPage />} />
      </Route>

      <Route
        path="/owner"
        element={
          <ProtectedRoute role="owner">
            <OwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OwnerDashboardPage />} />
        <Route path="update-password" element={<UpdatePasswordPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
