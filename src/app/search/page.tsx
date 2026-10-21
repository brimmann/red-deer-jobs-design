import type { Metadata } from "next"
import { Suspense } from "react"

import { SearchResults } from "@/components/search-results"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Search jobs · Red Deer Jobs",
  description: "Browse and search local jobs in Red Deer, Alberta.",
}

function SearchResultsFallback() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-11 min-w-0 flex-1 animate-pulse rounded-xl bg-muted" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-muted sm:w-24" />
      </div>
      <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="h-44 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 border-t bg-background">
        <Suspense fallback={<SearchResultsFallback />}>
          <SearchResults />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
