import { ManageJobForm } from "@/components/manage-job-form"
import { ManageJobInvalidLink } from "@/components/manage-job-invalid-link"
import {
  fetchJobByEditToken,
  formatManageJobStatus,
  mapManageJobToFormValues,
} from "@/lib/jobs/manage-job"

type ManageJobPageLoaderProps = {
  params: Promise<{ token: string }>
}

export async function ManageJobPageLoader({ params }: ManageJobPageLoaderProps) {
  const { token } = await params
  const job = await fetchJobByEditToken(token)

  if (!job) {
    return <ManageJobInvalidLink />
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <ManageJobForm
        token={token}
        statusLabel={formatManageJobStatus(job.status)}
        initialValues={mapManageJobToFormValues(job)}
      />
    </div>
  )
}

export function ManageJobPageFallback() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  )
}
