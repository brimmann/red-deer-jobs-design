import type { AdminJobFormValues } from "@/lib/jobs/map-admin-job-form"
import { parsePayRange } from "@/lib/jobs/parse-pay-range"
import { createAdminClient } from "@/lib/supabase/admin"

export type ManageJobRecord = {
  id: string
  title: string
  company_name: string
  employer_email: string
  status: string
  pay_range: string | null
  employment_types: string[] | null
  description: string
  apply_value: string
  edit_token: string
}

export type ManageJobFormValues = AdminJobFormValues & {
  employerEmail: string
}

export type ManageJobStatusLabel =
  | "Pending Approval"
  | "Live"
  | "Expired"

function extractWorkplaceAddress(html: string): string {
  const match = html.match(
    /<strong>Workplace address:<\/strong>\s*([^<]+)/i
  )
  return match?.[1]?.trim() ?? ""
}

function stripWorkplaceAddressFromDescription(html: string): string {
  return html
    .replace(/<p><strong>Workplace address:<\/strong>\s*[^<]+<\/p>/i, "")
    .trim()
}

export function formatManageJobStatus(
  status: string
): ManageJobStatusLabel {
  switch (status.toLowerCase()) {
    case "live":
      return "Live"
    case "expired":
      return "Expired"
    default:
      return "Pending Approval"
  }
}

export function mapManageJobToFormValues(
  job: ManageJobRecord
): ManageJobFormValues {
  const pay = parsePayRange(job.pay_range)

  return {
    title: job.title,
    company: job.company_name,
    addressLine: extractWorkplaceAddress(job.description),
    employmentSetup: job.employment_types?.length
      ? job.employment_types
      : ["Full-Time"],
    payAmountMin: pay.payAmountMin,
    payAmountMax: pay.payAmountMax,
    payPreset: pay.payPreset,
    description: stripWorkplaceAddressFromDescription(job.description),
    applyTo: job.apply_value,
    employerEmail: job.employer_email,
  }
}

export async function fetchJobByEditToken(
  token: string
): Promise<ManageJobRecord | null> {
  const trimmed = token.trim()
  if (!trimmed) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, company_name, employer_email, status, pay_range, employment_types, description, apply_value, edit_token"
    )
    .eq("edit_token", trimmed)
    .maybeSingle()

  if (error) {
    console.error("fetchJobByEditToken:", error.message)
    return null
  }

  return data as ManageJobRecord | null
}
