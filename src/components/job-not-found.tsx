import Link from "next/link"
import { Briefcase } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "cn"

export function JobNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-16 sm:px-6 sm:py-20">
      <Card className="rounded-xl border-border/80 bg-card shadow-sm">
        <CardHeader className="items-center text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Briefcase className="size-5" aria-hidden />
          </span>
          <CardTitle>Job not found</CardTitle>
          <CardDescription className="max-w-sm text-balance">
            This listing may have been removed or the link is incorrect. Browse
            live roles on the job board instead.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <Link
            href="/search"
            className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
          >
            Back to All Jobs
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
