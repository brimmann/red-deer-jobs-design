"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionValue,
  isValidAdminSession,
  verifyAdminPassword,
} from "@/lib/admin/session"
import {
  isJobDescriptionEmpty,
  mapAdminJobFormToInsert,
  mapAdminJobFormToUpdate,
  type AdminJobFormValues,
} from "@/lib/jobs/map-admin-job-form"
import { createAdminClient } from "@/lib/supabase/admin"

async function requireAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!isValidAdminSession(session)) {
    throw new Error("Unauthorized")
  }
}

export async function loginAdmin(
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get("password")
  if (typeof password !== "string" || !verifyAdminPassword(password)) {
    return { error: "Invalid Admin Password" }
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  revalidatePath("/admin")
  redirect("/admin")
}

export async function approveJob(jobId: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("jobs")
      .update({ status: "live" })
      .eq("id", jobId)

    if (error) return { error: error.message }
    revalidatePath("/admin")
    return {}
  } catch {
    return { error: "Unauthorized" }
  }
}

export async function rejectJob(jobId: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession()
    const supabase = createAdminClient()
    const { error } = await supabase.from("jobs").delete().eq("id", jobId)

    if (error) return { error: error.message }
    revalidatePath("/admin")
    return {}
  } catch {
    return { error: "Unauthorized" }
  }
}

export async function unpublishJob(jobId: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("jobs")
      .update({ status: "expired" })
      .eq("id", jobId)

    if (error) return { error: error.message }
    revalidatePath("/admin")
    return {}
  } catch {
    return { error: "Unauthorized" }
  }
}

export async function republishJob(jobId: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("jobs")
      .update({
        status: "live",
        created_at: new Date().toISOString(),
      })
      .eq("id", jobId)

    if (error) return { error: error.message }
    revalidatePath("/admin")
    return {}
  } catch {
    return { error: "Unauthorized" }
  }
}

export async function deleteJob(jobId: string): Promise<{ error?: string }> {
  return rejectJob(jobId)
}

export async function updateAdminJob(
  jobId: string,
  values: AdminJobFormValues,
  employerEmail: string
): Promise<{ error?: string }> {
  try {
    await requireAdminSession()
    if (!jobId.trim()) return { error: "Invalid job." }
    if (!values.title.trim() || !values.company.trim()) {
      return { error: "Job title and company name are required." }
    }
    if (!values.employmentSetup.length) {
      return {
        error: "Select at least one employment type or work setup option.",
      }
    }
    if (isJobDescriptionEmpty(values.description)) {
      return { error: "Job description is required." }
    }
    if (!values.applyTo.trim()) {
      return { error: "Application link or email is required." }
    }
    if (!employerEmail.trim()) {
      return { error: "Employer email is required." }
    }

    const mapped = mapAdminJobFormToUpdate(values, employerEmail)
    const supabase = createAdminClient()
    const { data: existing, error: fetchError } = await supabase
      .from("jobs")
      .select("status")
      .eq("id", jobId)
      .maybeSingle()

    if (fetchError) return { error: fetchError.message }
    if (!existing) return { error: "Job not found." }

    const { error } = await supabase.from("jobs").update(mapped).eq("id", jobId)

    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/search")
    revalidatePath("/")
    if (existing.status === "live") {
      revalidatePath(`/jobs/${jobId}`)
    }

    return {}
  } catch {
    return { error: "Unauthorized" }
  }
}

export async function createAdminListing(
  values: AdminJobFormValues
): Promise<{ error?: string }> {
  try {
    await requireAdminSession()
    const supabase = createAdminClient()
    const row = mapAdminJobFormToInsert(values)
    const { error } = await supabase.from("jobs").insert(row)

    if (error) return { error: error.message }
    revalidatePath("/admin")
    return {}
  } catch {
    return { error: "Unauthorized" }
  }
}
