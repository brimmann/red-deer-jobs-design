"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Bell, Search, X } from "lucide-react"

import { JobCard } from "@/components/job-card"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { searchJobs } from "@/lib/jobs"
import { cn } from "cn"

export function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams.get("q") ?? ""
  const [keyword, setKeyword] = useState(queryFromUrl)

  useEffect(() => {
    setKeyword(queryFromUrl)
  }, [queryFromUrl])

  const trimmedQuery = queryFromUrl.trim()
  const results = useMemo(() => searchJobs(queryFromUrl), [queryFromUrl])

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
      ? `Showing ${results.length} job${results.length === 1 ? "" : "s"} for '${trimmedQuery}' in Red Deer`
      : `Showing ${results.length} job${results.length === 1 ? "" : "s"} in Red Deer`

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

      {results.length > 0 ? (
        <div className="flex flex-col gap-3">
          {results.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : trimmedQuery.length > 0 ? (
        <SearchEmptyState query={trimmedQuery} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          No jobs posted yet. Check back soon or{" "}
          <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
            return home
          </Link>
          .
        </p>
      )}
    </div>
  )
}

function SearchEmptyState({ query }: { query: string }) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle")

  function onAlertSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) {
      setStatus("error")
      return
    }
    setStatus("success")
    setEmail("")
  }

  return (
    <Card className="rounded-xl border-border/80 bg-card shadow-sm">
      <CardHeader className="items-center text-center">
        <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Bell className="size-5" aria-hidden />
        </span>
        <CardTitle className="text-balance">
          No jobs matching &apos;{query}&apos; yet.
        </CardTitle>
        <CardDescription className="max-w-md text-balance">
          Want us to email you when a &apos;{query}&apos; job opens up in Red
          Deer?
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <form
          onSubmit={onAlertSubmit}
          className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center"
          noValidate
        >
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (status !== "idle") setStatus("idle")
            }}
            aria-invalid={status === "error"}
            aria-describedby="search-alert-status"
            className="h-10 flex-1 rounded-xl"
          />
          <Button type="submit" className="h-10 shrink-0 rounded-xl sm:px-5">
            Get Alerted
          </Button>
        </form>
        <p
          id="search-alert-status"
          className={cn(
            "text-center text-xs text-muted-foreground",
            status === "error" && "text-destructive",
            status === "success" && "text-primary"
          )}
          role="status"
        >
          {status === "error"
            ? "Enter a valid email address."
            : status === "success"
              ? `We will email you when a ${query} job is posted.`
              : "Instant notification only when this specific job is posted. No spam."}
        </p>
        <Link
          href="/search"
          className={cn(
            buttonVariants({ variant: "link" }),
            "text-sm text-muted-foreground"
          )}
        >
          Or clear search to view all jobs
        </Link>
      </CardContent>
    </Card>
  )
}
