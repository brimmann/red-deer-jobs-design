"use client"

import Link from "next/link"
import { useState } from "react"
import { Bell } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "cn"

export function SearchEmptyState({ query }: { query: string }) {
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
        <CardTitle className="text-balance">No jobs found</CardTitle>
        <CardDescription className="max-w-md text-balance">
          Nothing matched &apos;{query}&apos; in Red Deer yet. Want us to email
          you when a &apos;{query}&apos; job opens up?
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
