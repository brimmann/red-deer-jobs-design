import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import type { Job } from "@/lib/jobs"
import { mapJobRowToJob, type JobListRow } from "@/lib/jobs/map-job-row"

const JOB_LIST_SELECT =
  "id, created_at, title, company_name, pay_range, employment_types, description, apply_method, apply_value"

function mapJobRows(data: JobListRow[] | null): Job[] {
  if (!data?.length) return []
  return data.map(mapJobRowToJob)
}

export async function fetchRecentLiveJobs(limit = 3): Promise<Job[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_LIST_SELECT)
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) return []
  return mapJobRows(data as JobListRow[] | null)
}

export async function fetchAllLiveJobs(): Promise<Job[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_LIST_SELECT)
    .eq("status", "live")
    .order("created_at", { ascending: false })

  if (error) return []
  return mapJobRows(data as JobListRow[] | null)
}

export async function searchLiveJobs(searchQuery: string): Promise<Job[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("search_jobs", {
    search_query: searchQuery.trim(),
  })

  if (error) return []
  return mapJobRows(data as JobListRow[] | null)
}

export async function fetchSearchPageJobs(query: string): Promise<Job[]> {
  const trimmed = query.trim()
  if (trimmed) return searchLiveJobs(trimmed)
  return fetchAllLiveJobs()
}

export const fetchJobById = cache(async (id: string): Promise<JobListRow | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_LIST_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  return data as JobListRow
})
