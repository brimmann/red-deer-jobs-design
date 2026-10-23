import { JobDetail } from "@/components/job-detail"
import { JobNotFound } from "@/components/job-not-found"
import { fetchJobById } from "@/lib/jobs/live-jobs"

type JobPageLoaderProps = {
  params: Promise<{ id: string }>
}

export async function JobPageLoader({ params }: JobPageLoaderProps) {
  const { id } = await params
  const job = await fetchJobById(id)
  return job ? <JobDetail job={job} /> : <JobNotFound />
}
