import type { Metadata } from "next"

import { PostJobForm } from "@/components/post-job-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Post a Job | Red Deer Jobs",
  description:
    "Post a local job in Red Deer for a $49 flat rate. One form, 30 days of reach, no password required.",
}

export default function PostJobPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <PostJobForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
