import Link from "next/link"
import { CheckCircle2, Link2Off } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "cn"

export function AlertConfirmInvalidLink() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-16 sm:px-6 sm:py-20">
      <Card className="rounded-xl border-border/80 bg-card shadow-sm">
        <CardHeader className="items-center text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Link2Off className="size-5" aria-hidden />
          </span>
          <CardTitle>Invalid or expired link</CardTitle>
          <CardDescription className="max-w-sm text-balance">
            This confirmation link is not valid anymore. Sign up again from the
            job board to get a fresh email.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 pb-6 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
          >
            Back to jobs
          </Link>
          <Link
            href="/search"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-xl"
            )}
          >
            Search jobs
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export function AlertConfirmSuccess({
  searchQuery,
}: {
  searchQuery: string | null
}) {
  const description =
    searchQuery === null
      ? "You are on the daily Red Deer list. We will email you when new roles go live."
      : `You will get an email when a new “${searchQuery}” job is posted in Red Deer.`

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-16 sm:px-6 sm:py-20">
      <Card className="rounded-xl border-border/80 bg-card shadow-sm">
        <CardHeader className="items-center text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
            <CheckCircle2 className="size-5" aria-hidden />
          </span>
          <CardTitle>Alerts confirmed</CardTitle>
          <CardDescription className="max-w-sm text-balance">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <Link
            href="/search"
            className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
          >
            Browse jobs
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
