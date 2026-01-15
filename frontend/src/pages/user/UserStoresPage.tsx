import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { api } from "../../lib/api"
import { toast } from "sonner"
import { RatingStars } from "../../components/RatingStars"
import { Button } from "../../components/ui/button"
import { formatRating } from "../../lib/utils"
import { Search, Store as StoreIcon, Star } from "lucide-react"

type Store = {
  id: number
  name: string
  address: string
  overallRating: number | null
  myRating: number | null
}

export function UserStoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [q, setQ] = useState("")
  const [active, setActive] = useState<Record<number, number>>({})

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get("/api/user/stores")
        setStores(res.data)
      } catch (e: any) {
        setStores([])
        toast.message("Backend not connected. Stores list empty.")
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return stores
    return stores.filter((s) => [s.name, s.address].some((v) => v.toLowerCase().includes(query)))
  }, [stores, q])

  const submit = async (storeId: number) => {
    const rating = active[storeId]
    if (!rating) return toast.error("Please select a rating (1-5).")

    try {
      await api.post("/api/user/ratings", { storeId, rating })
      toast.success("Rating submitted")
      setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, myRating: rating } : s)))
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to submit rating")
    }
  }

  const modify = async (storeId: number) => {
    const rating = active[storeId]
    if (!rating) return toast.error("Please select a rating (1-5).")

    try {
      await api.patch(`/api/user/ratings/${storeId}`, { rating })
      toast.success("Rating updated")
      setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, myRating: rating } : s)))
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update rating")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">USER</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Stores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search stores and submit your rating (1–5). You can modify it anytime.
          </p>
        </div>

        <div className="rounded-2xl border bg-card/75 px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
          <span className="font-semibold text-foreground">{stores.length}</span> stores
        </div>
      </div>

      {/* Search */}
      <Card className="overflow-hidden">
        <div className="border-b bg-secondary/30 px-6 py-4">
          <p className="text-sm font-semibold tracking-tight text-foreground">Search</p>
          <p className="text-xs text-muted-foreground">Filter by store name or address</p>
        </div>

        <CardContent className="p-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search stores"
              placeholder="Search stores..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Store list */}
      {filtered.length === 0 ? (
        <Card className="overflow-hidden">
          <CardContent className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border bg-secondary/35">
              <StoreIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">No stores found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try changing your search keywords.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((s) => {
            const current = active[s.id] ?? s.myRating ?? 0
            const hasSubmitted = s.myRating !== null

            return (
              <Card key={s.id} className="overflow-hidden">
                {/* Card header */}
                <div className="border-b bg-secondary/20 px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">{s.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{s.address}</p>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-foreground">{formatRating(s.overallRating)}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-5 p-6">
                  {/* rating summary */}
                  <div className="grid gap-3 rounded-2xl border bg-card/70 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Overall rating</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{formatRating(s.overallRating)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Your rating</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{s.myRating ?? "—"}</p>
                    </div>
                  </div>

                  {/* rating stars */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Submit / modify rating</p>
                    <RatingStars
                      value={current}
                      onChange={(v) => setActive((p) => ({ ...p, [s.id]: v }))}
                      label={`Rate store ${s.name}`}
                    />
                  </div>

                  {/* actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      aria-label={`Submit rating for ${s.name}`}
                      onClick={() => submit(s.id)}
                      disabled={hasSubmitted}
                    >
                      Submit
                    </Button>

                    <Button
                      variant="outline"
                      aria-label={`Modify rating for ${s.name}`}
                      onClick={() => modify(s.id)}
                      disabled={!hasSubmitted}
                    >
                      Modify
                    </Button>

                    <span className="ml-auto text-xs text-muted-foreground">
                      {hasSubmitted ? "Submitted" : "Not submitted"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
