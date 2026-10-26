import type { Metadata } from "next"

import {
  AlertConfirmInvalidLink,
  AlertConfirmSuccess,
} from "@/components/alert-confirm-states"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { confirmJobAlertToken } from "@/lib/job-alerts"

export const metadata: Metadata = {
  title: "Confirm job alerts | Red Deer Jobs",
  description: "Confirm your email for Red Deer Jobs alerts.",
}

export default async function AlertConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const result = await confirmJobAlertToken(token)

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        {result.ok ? (
          <AlertConfirmSuccess searchQuery={result.searchQuery} />
        ) : (
          <AlertConfirmInvalidLink />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
