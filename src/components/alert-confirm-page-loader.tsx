import {
  AlertConfirmInvalidLink,
  AlertConfirmSuccess,
} from "@/components/alert-confirm-states"
import { confirmJobAlertToken } from "@/lib/job-alerts"

type AlertConfirmPageLoaderProps = {
  params: Promise<{ token: string }>
}

export async function AlertConfirmPageLoader({
  params,
}: AlertConfirmPageLoaderProps) {
  const { token } = await params
  const result = await confirmJobAlertToken(token)

  if (result.ok) {
    return <AlertConfirmSuccess searchQuery={result.searchQuery} />
  }

  return <AlertConfirmInvalidLink />
}

export function AlertConfirmPageFallback() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-16 sm:px-6 sm:py-20">
      <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-muted" />
        <div className="mx-auto h-7 w-48 animate-pulse rounded-md bg-muted" />
        <div className="mx-auto h-12 w-full max-w-sm animate-pulse rounded-md bg-muted" />
        <div className="mx-auto mt-2 h-10 w-32 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  )
}
