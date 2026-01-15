import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Card, CardContent } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { api } from "../../lib/api"
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react"

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/

const schema = z.object({
  oldPassword: z.string().min(1, "Old password required"),
  newPassword: z.string().regex(passwordRegex, "8-16 chars, include 1 uppercase + 1 special"),
})

type FormValues = z.infer<typeof schema>

export function UpdatePasswordPage() {
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { oldPassword: "", newPassword: "" },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await api.patch("/api/auth/update-password", values)
      toast.success("Password updated")
      form.reset()
      setShowOld(false)
      setShowNew(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update password")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">SECURITY</p>

          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground">
            <KeyRound className="h-6 w-6 text-primary" />
            Update Password
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Keep your account secure by choosing a strong password.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border bg-card/70 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Rules enforced automatically
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="border-b bg-secondary/30 px-6 py-4">
            <p className="text-sm font-semibold tracking-tight text-foreground">Password Update</p>
            <p className="text-xs text-muted-foreground">Enter old password and choose a secure new one.</p>
          </div>

          <CardContent className="p-6">
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Old password */}
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Old password</Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    aria-label="Old password"
                    type={showOld ? "text" : "password"}
                    {...form.register("oldPassword")}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    aria-label={showOld ? "Hide old password" : "Show old password"}
                    onClick={() => setShowOld((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-2xl p-2 text-muted-foreground hover:bg-secondary/60"
                  >
                    {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {form.formState.errors.oldPassword?.message ? (
                  <p className="text-xs font-medium text-red-600">{form.formState.errors.oldPassword.message}</p>
                ) : null}
              </div>

              {/* New password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    aria-label="New password"
                    type={showNew ? "text" : "password"}
                    {...form.register("newPassword")}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    aria-label={showNew ? "Hide new password" : "Show new password"}
                    onClick={() => setShowNew((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-2xl p-2 text-muted-foreground hover:bg-secondary/60"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {form.formState.errors.newPassword?.message ? (
                  <p className="text-xs font-medium text-red-600">{form.formState.errors.newPassword.message}</p>
                ) : null}

                <p className="text-xs text-muted-foreground">
                  Tip: Use a mix of uppercase + special character for strong security.
                </p>
              </div>

              <Button type="submit" className="w-full" aria-label="Update password">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="overflow-hidden">
          <div className="border-b bg-secondary/30 px-6 py-4">
            <p className="text-sm font-semibold tracking-tight text-foreground">Password Rules</p>
            <p className="text-xs text-muted-foreground">These are required</p>
          </div>

          <CardContent className="p-6">
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border bg-card/70 p-4">
                <p className="text-sm font-medium text-foreground">Length</p>
                <p className="mt-1 text-xs text-muted-foreground">8 to 16 characters</p>
              </div>

              <div className="rounded-2xl border bg-card/70 p-4">
                <p className="text-sm font-medium text-foreground">Uppercase</p>
                <p className="mt-1 text-xs text-muted-foreground">At least 1 capital letter (A-Z)</p>
              </div>

              <div className="rounded-2xl border bg-card/70 p-4">
                <p className="text-sm font-medium text-foreground">Special character</p>
                <p className="mt-1 text-xs text-muted-foreground">One of: ! @ # $ % ^ & *</p>
              </div>

              <div className="rounded-2xl border bg-secondary/25 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Password update is validated on both frontend + backend.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
