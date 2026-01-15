import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { AuthShell } from "./AuthShell"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { api } from "../../lib/api"
import { useAuth } from "../../state/auth"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
})

type FormValues = z.infer<typeof schema>

type RoleKey = "admin" | "owner" | "user"

const demoCreds: Record<RoleKey, { label: string; email: string; password: string }> = {
  admin: { label: "Admin", email: "admin@roxiler.com", password: "Admin@123" },
  owner: { label: "Store Owner", email: "owner@roxiler.com", password: "Owner@123" },
  user: { label: "Normal User", email: "user@roxiler.com", password: "User@1234" },
}

export function LoginPage() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleKey>("user")

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const fillDemo = (role: RoleKey) => {
    setSelectedRole(role)
    form.setValue("email", demoCreds[role].email, { shouldValidate: true })
    form.setValue("password", demoCreds[role].password, { shouldValidate: true })
   
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await api.post("/api/auth/login", values)
      login(res.data)
      toast.success("Logged in successfully")
      nav(`/${res.data.user.role}`)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Login failed")
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Login with your account to continue.">
      
      <div className="mb-5 space-y-2">
        <p className="text-xs font-bold tracking-wide text-muted-foreground">DEMO QUICK LOGIN</p>

        <div className="rounded-2xl border bg-white/70 p-1 shadow-soft">
          <div className="grid grid-cols-3 gap-1">
            {(["admin", "owner", "user"] as RoleKey[]).map((role) => {
              const active = selectedRole === role

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className={[
                    "rounded-2xl px-3 py-2 text-xs font-bold transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  ].join(" ")}
                  aria-label={`Auto-fill ${demoCreds[role].label} credentials`}
                >
                  {demoCreds[role].label}
                </button>
              )
            })}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Tip: click a role to auto-fill email & password.
        </p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" aria-label="Email" placeholder="your@email.com" {...form.register("email")} />
          {form.formState.errors.email?.message ? (
            <p className="text-xs font-semibold text-red-600">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>

          <div className="relative">
            <Input
              id="password"
              aria-label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              {...form.register("password")}
              className="pr-12"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-2xl p-2 text-muted-foreground hover:bg-secondary/60"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {form.formState.errors.password?.message ? (
            <p className="text-xs font-semibold text-red-600">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <Button className="w-full" type="submit" aria-label="Login">
          Login
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-bold text-primary underline underline-offset-4">
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
