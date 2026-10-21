import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, ExternalLink, Mail } from "lucide-react"

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
import { formatPosted, type Job } from "@/lib/jobs"
import { cn } from "cn"

export function JobDetail({ job }: { job: Job }) {
  const workplace = job.remote ? "Remote" : "On-site"

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "-ml-2.5 w-fit rounded-xl text-muted-foreground"
        )}
      >
        <ArrowLeft />
        Back to Jobs
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
                    {job.company}
                  </span>
                  <span className="px-2" aria-hidden>
                    ·
                  </span>
                  Red Deer, AB
                  <span className="px-2" aria-hidden>
                    ·
                  </span>
                  Posted {formatPosted(job.posted)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{job.type}</Badge>
                <Badge variant="outline">{workplace}</Badge>
                <Badge variant="outline">{job.salary}</Badge>
                {job.urgent ? <Badge>Urgent Hire</Badge> : null}
              </div>
            </CardHeader>
          </Card>

          <Section title="About the Role">
            <p className="text-base leading-7">{job.about}</p>
          </Section>

          <Section title="Key Responsibilities">
            <BulletList items={job.responsibilities} />
          </Section>

          <Section title="Requirements & Qualifications">
            <BulletList items={job.requirements} />
          </Section>

          <section
            id="apply"
            className="flex scroll-mt-24 flex-col gap-3 rounded-xl bg-muted p-5 sm:p-6"
          >
            <h2 className="text-lg font-medium tracking-tight">
              Application Instructions
            </h2>
            <p className="text-base leading-7">{job.apply}</p>
          </section>

          <Card className="rounded-xl bg-card shadow-sm">
            <CardHeader className="gap-1">
              <p className="text-sm text-muted-foreground">Pay range</p>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                {job.salary}
              </p>
              <p className="text-sm text-muted-foreground">
                {job.type}
                <span className="px-1.5" aria-hidden>
                  ·
                </span>
                {workplace}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <EmployerContact job={job} />
              <SaveJobButton />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-accent font-medium text-accent-foreground">
                    {job.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {job.company}
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

function EmployerContact({ job }: { job: Job }) {
  if (!job.website && !job.email) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        This employer has not added a website or email yet.
      </p>
    )
  }

  return (
    <>
      {job.website ? (
        <a
          href={job.website}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-10 w-full rounded-xl"
          )}
        >
          <ExternalLink />
          Employer website
        </a>
      ) : null}
      {job.email ? (
        <a
          href={`mailto:${job.email}`}
          className={cn(
            buttonVariants({
              variant: job.website ? "outline" : "default",
              size: "lg",
            }),
            "h-10 w-full min-w-0 rounded-xl"
          )}
        >
          <Mail />
          <span className="min-w-0 truncate">{job.email}</span>
        </a>
      ) : null}
    </>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-base leading-7 marker:text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="pl-1">
          {item}
        </li>
      ))}
    </ul>
  )
}
