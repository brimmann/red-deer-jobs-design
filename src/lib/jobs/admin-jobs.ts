import type { AdminListing, AdminListingStatus } from "@/lib/admin-listings"
import { createAdminClient } from "@/lib/supabase/admin"
import { stripHtml } from "@/lib/jobs/map-job-row"

export type JobAdminRow = {
  id: string
  created_at: string
  title: string
  company_name: string
  employer_email: string
  status: string
  pay_range: string | null
  employment_types: string[] | null
  description: string
  apply_method: string
  apply_value: string
}

const WORK_SETUP_TAGS = new Set(["On-Site", "Hybrid", "Remote"])

function formatPostedDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function mapDbStatus(status: string): AdminListingStatus {
  switch (status.toLowerCase()) {
    case "live":
      return "Live"
    case "expired":
      return "Expired"
    default:
      return "Pending"
  }
}

function extractWorkplaceAddress(html: string): string | undefined {
  const match = html.match(
    /<strong>Workplace address:<\/strong>\s*([^<]+)/i
  )
  return match?.[1]?.trim() || undefined
}

export function mapJobRowToAdminListing(row: JobAdminRow): AdminListing {
  const tags = row.employment_types ?? []
  const setup = tags.filter((tag) => WORK_SETUP_TAGS.has(tag))
  const employmentTypes = tags.filter((tag) => !WORK_SETUP_TAGS.has(tag))

  return {
    id: row.id,
    title: row.title,
    company: row.company_name,
    employerEmail: row.employer_email,
    postedDate: formatPostedDate(row.created_at),
    status: mapDbStatus(row.status),
    pay: row.pay_range?.trim() || "—",
    employmentTypes: employmentTypes.length ? employmentTypes : ["Full-Time"],
    setup: setup.length ? setup : ["On-Site"],
    workplaceAddress: extractWorkplaceAddress(row.description),
    description: stripHtml(row.description),
    applyTo: row.apply_value,
  }
}

export async function fetchAllJobsForAdmin(): Promise<AdminListing[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, created_at, title, company_name, employer_email, status, pay_range, employment_types, description, apply_method, apply_value"
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("fetchAllJobsForAdmin:", error.message)
    return []
  }

  return (data as JobAdminRow[]).map(mapJobRowToAdminListing)
}
