import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { AuthShell } from "./AuthShell"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { api } from "../../lib/api"

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/

const schema = z.object({
  
  name: z.string().min(10, "Name must be at least 10 characters").max(60, "Name must be at most 60 characters"),
  email: z.string().email("Enter a valid email"),
  address: z.string().max(400, "Address must be <= 400 characters"),
  password: z.string().regex(passwordRegex, "Password must be 8-16 chars, include 1 uppercase + 1 special"),
})

type FormValues = z.infer<typeof schema>

export function SignupPage() {
  const nav = useNavigate()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", address: "", password: "" },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      
      await api.post("/api/auth/signup", values)
      toast.success("Account created. Please login.")
      nav("/login")
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Signup failed")
    }
  }

  return (
    <AuthShell title="Create account" subtitle="Signup as a normal user. Admin can add other roles.">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>

        
          <Input id="name" aria-label="Name" placeholder="Full name (10-50 chars)" {...form.register("name")} />

          {form.formState.errors.name?.message ? (
            <p className="text-xs font-semibold text-red-600">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" aria-label="Email" placeholder="you@example.com" {...form.register("email")} />
          {form.formState.errors.email?.message ? (
            <p className="text-xs font-semibold text-red-600">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" aria-label="Address" placeholder="Max 400 characters" {...form.register("address")} />
          {form.formState.errors.address?.message ? (
            <p className="text-xs font-semibold text-red-600">{form.formState.errors.address.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            aria-label="Password"
            type="password"
            placeholder="8-16 chars, uppercase + special"
            {...form.register("password")}
          />
          {form.formState.errors.password?.message ? (
            <p className="text-xs font-semibold text-red-600">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <Button className="w-full" type="submit" aria-label="Create account">
          Create account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary underline underline-offset-4">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
