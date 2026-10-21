"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  BadgeCheck,
  CircleDollarSign,
  MapPin,
  Search,
  Users,
} from "lucide-react"

import { AlertSignup } from "@/components/alert-signup"
import { HeroDotGrid } from "@/components/hero-dot-grid"
import { Badge } from "@/components/ui/badge"
import { JobCard } from "@/components/job-card"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { getRecentJobs } from "@/lib/jobs"
import { cn } from "cn"

const popularSearchTerms = [
  "Electrician",
  "Prairie Grid",
  "Healthcare",
  "Part-Time",
] as const

export function HomeBoard() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")
  const [appliedKeyword, setAppliedKeyword] = useState("")

  const recentJobs = useMemo(
    () => getRecentJobs(3, appliedKeyword),
    [appliedKeyword]
  )

  function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = keyword.trim()
    if (next) {
      router.push(`/search?q=${encodeURIComponent(next)}`)
      return
    }
    setAppliedKeyword("")
  }

  function onPopularSearch(term: string) {
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-muted/50">
        <HeroDotGrid />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/35 sm:to-background/50"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="flex max-w-2xl flex-col items-center gap-4">
            
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Jobs for our city.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              We made this for us. Every employer is local, and the work stays
              in Red Deer.
            </p>
          </div>
          <Card className="w-full rounded-xl border-border/80 bg-card shadow-md ring-1 ring-foreground/5">
            <CardContent className="flex flex-col gap-4">
              <form
                onSubmit={onSearch}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="keywords"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Job title or keywords"
                    aria-label="Job title or keywords"
                    className="h-10 rounded-xl pl-9"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-10 w-full shrink-0 rounded-xl px-4 sm:w-auto"
                >
                  Search Jobs
                </Button>
              </form>
              <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible">
                <span className="shrink-0 text-xs text-muted-foreground">
                  Try:
                </span>
                {popularSearchTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onPopularSearch(term)}
                    className={cn(
                      "shrink-0 rounded-4xl border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted",
                      appliedKeyword === term && "border-primary bg-accent"
                    )}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-8">
          <section id="jobs" className="flex scroll-mt-24 flex-col gap-4">
            <h2 className="text-lg font-medium">Recent jobs</h2>
            <div className="flex flex-col gap-3">
              {recentJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <Card id="employers" className="scroll-mt-24 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle>Why post here?</CardTitle>
                <CardDescription>
                  A small board for employers hiring in Red Deer.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Users className="size-4" />
                  </span>
                  <p className="leading-relaxed">
                    Reach people who already live and work in Red Deer.
                  </p>
                </div>
                <Separator />
                <div id="pricing" className="flex scroll-mt-24 items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <CircleDollarSign className="size-4" />
                  </span>
                  <p className="leading-relaxed">
                    Flat-rate pricing: $49 for 30 days. No bids and no
                    per-click fees.
                  </p>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <BadgeCheck className="size-4" />
                  </span>
                  <p className="leading-relaxed">
                    Each employer is reviewed before a listing goes live.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href="/post"
                  className={cn(buttonVariants(), "w-full rounded-xl")}
                >
                  Post a Job
                </Link>
              </CardFooter>
            </Card>
            <AlertSignup />
          </aside>
        </div>
      </div>
    </div>
  )
}
