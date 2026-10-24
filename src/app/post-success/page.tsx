import type { Metadata } from "next"
import { Suspense } from "react"

import {
  PostSuccessContent,
  PostSuccessFallback,
} from "@/components/post-success-content"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Payment Received | Red Deer Jobs",
  description:
    "Your job posting payment was received. Check your email for your management link.",
}

export default function PostSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<PostSuccessFallback />}>
          <PostSuccessContent searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
