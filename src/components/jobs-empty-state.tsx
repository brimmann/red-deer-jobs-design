import Link from "next/link"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

export function JobsEmptyState() {
  return (
    <Card className="rounded-xl border border-dashed bg-muted/30 shadow-none">
      <CardContent className="px-4 py-10 text-center text-sm text-muted-foreground">
        No jobs posted yet. Check back soon or{" "}
        <Link
          href="/post"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          post a job
        </Link>
        .
      </CardContent>
    </Card>
  )
}
