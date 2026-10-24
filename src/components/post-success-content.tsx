import Link from "next/link"
import { CheckCircle2, Mail } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "cn"

type PostSuccessContentProps = {
  searchParams: Promise<{ session_id?: string }>
}

export async function PostSuccessContent({
  searchParams,
}: PostSuccessContentProps) {
  const { session_id: sessionId } = await searchParams
  const hasSession = Boolean(sessionId?.trim())

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-16 sm:px-6 sm:py-20">
      <Card className="rounded-xl border-border/80 bg-card shadow-sm">
        <CardHeader className="items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 className="size-6" aria-hidden />
          </span>
          <CardTitle>
            {hasSession ? "Payment received" : "Confirming your payment"}
          </CardTitle>
          <CardDescription className="max-w-sm text-balance">
            {hasSession ? (
              <>
                Thanks for posting on Red Deer Jobs. Your listing is{" "}
                <strong>pending approval</strong> and usually goes live after a
                quick review.
              </>
            ) : (
              <>
                We could not find a checkout session on this link. Return from
                Stripe checkout or check your email for your management link.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pb-6">
          <div className="flex gap-3 rounded-xl border bg-muted/40 p-4">
            <Mail
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">
              We emailed a magic link to manage your posting (edit, renew, or
              remove). If it is not in your inbox within a few minutes, check
              spam or wait for the webhook to finish processing.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
            >
              Back to job board
            </Link>
            <Link
              href="/post"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl"
              )}
            >
              Post another job
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function PostSuccessFallback() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-16 sm:px-6 sm:py-20">
      <div className="flex flex-col gap-6 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="mx-auto size-12 animate-pulse rounded-xl bg-muted" />
        <div className="mx-auto h-7 w-48 animate-pulse rounded-md bg-muted" />
        <div className="mx-auto h-16 w-full max-w-sm animate-pulse rounded-md bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted sm:w-40" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted sm:w-40" />
        </div>
      </div>
    </div>
  )
}
