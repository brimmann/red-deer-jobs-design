import { JobsEmptyState } from "@/components/jobs-empty-state"
import { JobCard } from "@/components/job-card"
import { fetchRecentLiveJobs } from "@/lib/jobs/live-jobs"

export async function RecentJobsFeed() {
  const jobs = await fetchRecentLiveJobs(3)

  if (jobs.length === 0) {
    return <JobsEmptyState />
  }

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
