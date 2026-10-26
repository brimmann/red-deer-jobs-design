import type { Metadata } from "next"
import { Suspense } from "react"

import {
  AlertConfirmPageFallback,
  AlertConfirmPageLoader,
} from "@/components/alert-confirm-page-loader"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Confirm job alerts | Red Deer Jobs",
  description: "Confirm your email for Red Deer Jobs alerts.",
}

export default function AlertConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<AlertConfirmPageFallback />}>
          <AlertConfirmPageLoader params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
