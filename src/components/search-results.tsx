"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { Search, X } from "lucide-react"

import { JobCard } from "@/components/job-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Job } from "@/lib/jobs"

type SearchResultsProps = {
  query: string
  jobs: Job[]
  emptyState: ReactNode
}

export function SearchResults({
  query,
  jobs,
  emptyState,
}: SearchResultsProps) {
  const router = useRouter()
  const [keyword, setKeyword] = useState(query)

  useEffect(() => {
    setKeyword(query)
  }, [query])

  const trimmedQuery = query.trim()

  function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = keyword.trim()
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search")
  }

  function clearSearchInput() {
    setKeyword("")
  }

  const contextLine =
    trimmedQuery.length > 0
      ? `Showing ${jobs.length} job${jobs.length === 1 ? "" : "s"} for '${trimmedQuery}' in Red Deer`
      : `Showing ${jobs.length} job${jobs.length === 1 ? "" : "s"} in Red Deer`

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2">
        <form
          onSubmit={onSearch}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Job title or keywords"
              aria-label="Search jobs"
              className="h-11 rounded-xl pr-10 pl-9"
            />
            {keyword.length > 0 ? (
              <button
                type="button"
                onClick={clearSearchInput}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <Button
            type="submit"
            className="h-11 w-full shrink-0 rounded-xl px-5 sm:w-auto"
          >
            Search
          </Button>
        </form>
        <p className="text-sm text-muted-foreground">{contextLine}</p>
      </div>

      {jobs.length > 0 ? (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        emptyState
      )}
    </div>
  )
}
