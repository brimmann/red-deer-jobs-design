import type { Job, JobType } from "@/lib/jobs"

export type JobListRow = {
  id: string
  created_at: string
  title: string
  company_name: string
  pay_range: string | null
  employment_types: string[] | null
  description: string
  apply_method: string
  apply_value: string
}

const JOB_TYPES: JobType[] = ["Full-Time", "Part-Time"]

export function companyInitials(companyName: string): string {
  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
  return initials || "RD"
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function resolveJobType(employmentTypes: string[] | null): JobType {
  const match = employmentTypes?.find((tag) =>
    JOB_TYPES.includes(tag as JobType)
  )
  return (match as JobType | undefined) ?? "Full-Time"
}

export function formatPostedRelative(createdAt: string): string {
  const created = new Date(createdAt)
  const diffMs = Date.now() - created.getTime()
  if (!Number.isFinite(diffMs) || diffMs < 0) return "Just now"

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function mapJobRowToJob(row: JobListRow): Job {
  const employmentTypes = row.employment_types ?? []
  const plainDescription = stripHtml(row.description)
  const summary =
    plainDescription.length > 160
      ? `${plainDescription.slice(0, 157)}…`
      : plainDescription

  return {
    id: row.id,
    title: row.title,
    company: row.company_name,
    initials: companyInitials(row.company_name),
    category: "Trades",
    type: resolveJobType(employmentTypes),
    salary: row.pay_range?.trim() || "Competitive",
    posted: formatPostedRelative(row.created_at),
    remote: employmentTypes.includes("Remote"),
    urgent: false,
    summary: summary || row.title,
    about: plainDescription || row.title,
    responsibilities: [],
    requirements: [],
    website: row.apply_method === "url" ? row.apply_value : undefined,
    email: row.apply_method === "email" ? row.apply_value : undefined,
    apply: row.apply_value,
  }
}
