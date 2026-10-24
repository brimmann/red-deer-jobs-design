"use server"

import { revalidatePath } from "next/cache"

import {
  isJobDescriptionEmpty,
  mapAdminJobFormToInsert,
  type AdminJobFormValues,
} from "@/lib/jobs/map-admin-job-form"
import { fetchJobByEditToken } from "@/lib/jobs/manage-job"
import { createAdminClient } from "@/lib/supabase/admin"

async function getJobIdForToken(token: string): Promise<string | null> {
  const job = await fetchJobByEditToken(token)
  return job?.id ?? null
}

export async function updateManagedJob(
  token: string,
  values: AdminJobFormValues
): Promise<{ error?: string }> {
  const trimmedToken = token.trim()
  if (!trimmedToken) return { error: "Invalid or expired link." }

  const job = await fetchJobByEditToken(trimmedToken)
  if (!job) return { error: "Invalid or expired link." }
  if (job.status === "expired") {
    return { error: "This listing has expired and can no longer be edited." }
  }

  if (!values.title.trim() || !values.company.trim()) {
    return { error: "Job title and company name are required." }
  }
  if (!values.employmentSetup.length) {
    return { error: "Select at least one employment type or work setup option." }
  }
  if (isJobDescriptionEmpty(values.description)) {
    return { error: "Job description is required." }
  }
  if (!values.applyTo.trim()) {
    return { error: "Application link or email is required." }
  }

  const mapped = mapAdminJobFormToInsert(values)
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("jobs")
    .update({
      title: mapped.title,
      company_name: mapped.company_name,
      pay_range: mapped.pay_range,
      employment_types: mapped.employment_types,
      description: mapped.description,
      apply_method: mapped.apply_method,
      apply_value: mapped.apply_value,
    })
    .eq("edit_token", trimmedToken)

  if (error) return { error: error.message }

  revalidatePath(`/manage-job/${trimmedToken}`)
  revalidatePath("/search")
  revalidatePath("/")
  if (job.status === "live") {
    revalidatePath(`/jobs/${job.id}`)
  }

  return {}
}

export async function expireManagedJob(
  token: string
): Promise<{ error?: string }> {
  const trimmedToken = token.trim()
  if (!trimmedToken) return { error: "Invalid or expired link." }

  const jobId = await getJobIdForToken(trimmedToken)
  if (!jobId) return { error: "Invalid or expired link." }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("jobs")
    .update({ status: "expired" })
    .eq("edit_token", trimmedToken)

  if (error) return { error: error.message }

  revalidatePath(`/manage-job/${trimmedToken}`)
  revalidatePath("/search")
  revalidatePath("/")
  revalidatePath(`/jobs/${jobId}`)
  revalidatePath("/admin")

  return {}
}
