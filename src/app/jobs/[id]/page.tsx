import type { Metadata } from "next"
import { Suspense } from "react"

import { JobDetailSkeleton } from "@/components/job-detail-skeleton"
import { JobPageLoader } from "@/components/job-page-loader"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Job listing · Red Deer Jobs",
  description: "Local job details in Red Deer, Alberta.",
}

/** Dynamic Supabase fetch; opt out of instant-nav prerender validation (Next.js 16). */
export const instant = false

export default function JobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<JobDetailSkeleton />}>
          <JobPageLoader params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
