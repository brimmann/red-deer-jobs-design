import Link from "next/link"
import { ArrowLeft, BadgeCheck, ExternalLink, Mail } from "lucide-react"

import { JobDocumentTitle } from "@/components/job-document-title"
import { SaveJobButton } from "@/components/save-job-button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { formatPosted } from "@/lib/jobs"
import {
  companyInitials,
  formatPostedRelative,
  type JobListRow,
} from "@/lib/jobs/map-job-row"
import { cn } from "cn"

function normalizeApplyUrl(value: string): string {
  const trimmed = value.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  return `https://${trimmed}`
}

export function JobDetail({ job }: { job: JobListRow }) {
  const employmentTypes = job.employment_types ?? []
  const payRange = job.pay_range?.trim() || "Competitive"
  const postedLabel = formatPosted(formatPostedRelative(job.created_at))

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <JobDocumentTitle title={job.title} />
      <Link
        href="/search"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "-ml-2.5 w-fit rounded-xl text-muted-foreground"
        )}
      >
        <ArrowLeft />
        Back to All Jobs
      </Link>

      <article className="flex flex-col gap-8">
        <Card className="rounded-xl bg-card shadow-sm">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
                {job.title}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                <span className="font-medium text-foreground">
                  {job.company_name}
                </span>
                <span className="px-2" aria-hidden>
                  ·
                </span>
                Red Deer, AB
                <span className="px-2" aria-hidden>
                  ·
                </span>
                Posted {postedLabel}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {employmentTypes.length > 0 ? (
                employmentTypes.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary">Local role</Badge>
              )}
              <Badge variant="outline">{payRange}</Badge>
            </div>
          </CardHeader>
        </Card>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium tracking-tight">Job description</h2>
          <div
            className="text-base leading-7 text-foreground [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_li>p]:my-0 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </section>

        <Card className="rounded-xl bg-card shadow-sm">
          <CardHeader className="gap-1">
            <p className="text-sm text-muted-foreground">Pay range</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {payRange}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ApplyNowButton job={job} />
            <SaveJobButton />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback className="bg-accent font-medium text-accent-foreground">
                  {companyInitials(job.company_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {job.company_name}
                </p>
                <p className="text-muted-foreground">Red Deer, AB</p>
              </div>
            </div>
            <Badge variant="secondary">
              <BadgeCheck />
              Verified local
            </Badge>
          </CardFooter>
        </Card>
      </article>
    </div>
  )
}

function ApplyNowButton({ job }: { job: JobListRow }) {
  if (job.apply_method === "email") {
    return (
      <a
        href={`mailto:${job.apply_value.trim()}`}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-xl")}
      >
        <Mail />
        Apply Now
      </a>
    )
  }

  return (
    <a
      href={normalizeApplyUrl(job.apply_value)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-xl")}
    >
      <ExternalLink />
      Apply Now
    </a>
  )
}
