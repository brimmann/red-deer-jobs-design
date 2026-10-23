import { JobsEmptyState } from "@/components/jobs-empty-state"
import { SearchEmptyState } from "@/components/search-empty-state"
import { SearchResults } from "@/components/search-results"
import { fetchSearchPageJobs } from "@/lib/jobs/live-jobs"

type SearchResultsLoaderProps = {
  query: string
}

export async function SearchResultsLoader({ query }: SearchResultsLoaderProps) {
  const jobs = await fetchSearchPageJobs(query)
  const trimmedQuery = query.trim()

  return (
    <SearchResults
      query={query}
      jobs={jobs}
      emptyState={
        trimmedQuery.length > 0 ? (
          <SearchEmptyState query={trimmedQuery} />
        ) : (
          <JobsEmptyState />
        )
      }
    />
  )
}
