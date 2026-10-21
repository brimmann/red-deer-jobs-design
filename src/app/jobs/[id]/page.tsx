import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JobDetail } from "@/components/job-detail"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { getJob, jobs } from "@/lib/jobs"

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const job = getJob(id)
  if (!job) return { title: "Job not found · Red Deer Jobs" }

  return {
    title: `${job.title} · Red Deer Jobs`,
    description: job.summary,
  }
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = getJob(id)
  if (!job) notFound()

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <JobDetail job={job} />
      </main>
      <SiteFooter />
    </div>
  )
}
