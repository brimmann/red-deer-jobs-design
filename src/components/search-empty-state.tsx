"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Bell } from "lucide-react"

import { submitJobAlertSignup } from "@/app/alerts/actions"
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
  const [status, setStatus] = useState<
    "idle" | "error" | "confirmation_sent" | "server_error"
  >("idle")
  const [isPending, startTransition] = useTransition()

  function onAlertSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) {
      setStatus("error")
      return
    }

    startTransition(async () => {
      const result = await submitJobAlertSignup({
        email,
        searchQuery: query,
      })
      if (result.ok) {
        setStatus("confirmation_sent")
        setEmail("")
        return
      }
      if (result.status === "invalid_email") {
        setStatus("error")
        return
      }
      setStatus("server_error")
    })
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
            disabled={isPending}
          />
          <Button
            type="submit"
            className="h-10 shrink-0 rounded-xl sm:px-5"
            disabled={isPending}
          >
            {isPending ? "Sending…" : "Get Alerted"}
          </Button>
        </form>
        <p
          id="search-alert-status"
          className={cn(
            "text-center text-xs text-muted-foreground",
            status === "error" && "text-destructive",
            status === "server_error" && "text-destructive",
            status === "confirmation_sent" && "text-primary"
          )}
          role="status"
        >
          {status === "error"
            ? "Enter a valid email address."
            : status === "confirmation_sent"
              ? "Check your email to confirm this alert."
              : status === "server_error"
                ? "Something went wrong. Try again in a moment."
                : "We email you only when a matching job is posted. Confirm via the link we send."}
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
