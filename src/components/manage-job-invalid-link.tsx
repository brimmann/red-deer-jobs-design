import Link from "next/link"
import { Link2Off } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "cn"

export function ManageJobInvalidLink() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-16 sm:px-6 sm:py-20">
      <Card className="rounded-xl border-border/80 bg-card shadow-sm">
        <CardHeader className="items-center text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Link2Off className="size-5" aria-hidden />
          </span>
          <CardTitle>Invalid or Expired Link</CardTitle>
          <CardDescription className="max-w-sm text-balance">
            This management link is not valid anymore. Check your email for the
            latest link, or post a new job listing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 pb-6 sm:flex-row sm:justify-center">
          <Link
            href="/post"
            className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
          >
            Post a Job
          </Link>
          <Link
            href="/search"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-xl"
            )}
          >
            Browse Jobs
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
