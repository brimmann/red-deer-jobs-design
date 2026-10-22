"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { AdminCreateListingForm } from "@/components/admin-create-listing-form"
import { AdminListingCard } from "@/components/admin-listing-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  filterAdminListings,
  initialAdminListings,
  type AdminListing,
} from "@/lib/admin-listings"

function formatPostedToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date())
}

export function AdminDashboard() {
  const [search, setSearch] = useState("")
  const [listings, setListings] = useState<AdminListing[]>(
    initialAdminListings
  )

  const filteredListings = useMemo(
    () => filterAdminListings(listings, search),
    [listings, search]
  )

  function removeListing(id: string) {
    setListings((prev) => prev.filter((item) => item.id !== id))
  }

  function updateStatus(id: string, status: AdminListing["status"]) {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Admin Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Review employer submissions and publish listings directly.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="h-auto w-fit shrink-0 rounded-xl px-3 py-1 text-xs font-medium sm:text-sm"
          >
            🔒 Admin Session Active
          </Badge>
        </div>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter by job title or employer email…"
            className="h-10 rounded-xl bg-background pl-9"
            aria-label="Filter listings by job title or employer email"
          />
        </div>
      </header>

      <Tabs defaultValue="pending" className="gap-6">
        <TabsList className="h-auto w-full flex-wrap gap-1 rounded-xl p-1 sm:w-fit">
          <TabsTrigger
            value="pending"
            className="rounded-lg px-3 py-2 text-xs sm:text-sm"
          >
            Pending Approvals &amp; Jobs
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="rounded-lg px-3 py-2 text-xs sm:text-sm"
          >
            Create Admin Listing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          <div className="flex flex-col gap-4">
            {filteredListings.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
                No listings match your search.
              </div>
            ) : (
              filteredListings.map((listing) => (
                <AdminListingCard
                  key={listing.id}
                  listing={listing}
                  onApprove={(id) => updateStatus(id, "Live")}
                  onReject={removeListing}
                  onUnpublish={(id) => updateStatus(id, "Expired")}
                  onEdit={() => {
                    /* demo: no-op */
                  }}
                  onRepublish={(id) =>
                    setListings((prev) =>
                      prev.map((item) =>
                        item.id === id
                          ? {
                              ...item,
                              status: "Live",
                              postedDate: formatPostedToday(),
                            }
                          : item
                      )
                    )
                  }
                  onDelete={removeListing}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          <AdminCreateListingForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
