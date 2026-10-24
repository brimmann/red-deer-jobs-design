import type { Metadata } from "next"
import { Suspense } from "react"

import {
  ManageJobPageFallback,
  ManageJobPageLoader,
} from "@/components/manage-job-page-loader"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Manage Job | Red Deer Jobs",
  description:
    "Edit or remove your Red Deer Jobs listing using your secure management link.",
}

export default function ManageJobPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<ManageJobPageFallback />}>
          <ManageJobPageLoader params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
