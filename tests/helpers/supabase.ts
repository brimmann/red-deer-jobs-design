import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { requireEnv } from "./env"

export const TEST_PREFIX = "[TEST]"

let adminClient: SupabaseClient | null = null

export function getAdminSupabase(): SupabaseClient {
  if (!adminClient) {
    const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
    const key =
      process.env.SUPABASE_SECRET_KEY?.trim() ??
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    if (!key) {
      throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY")
    }
    adminClient = createClient(url, key)
  }
  return adminClient
}

export function getAnonSupabase(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  )
}

export type InsertTestJobOptions = {
  title?: string
  company_name?: string
  status?: "pending" | "live" | "expired"
  apply_method?: "url" | "email"
  apply_value?: string
  employer_email?: string
  description?: string
  employment_types?: string[]
  pay_range?: string | null
}

export async function insertTestJob(options: InsertTestJobOptions = {}) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const row = {
    title: options.title ?? `${TEST_PREFIX} Job ${suffix}`,
    company_name: options.company_name ?? `${TEST_PREFIX} Company`,
    pay_range: options.pay_range ?? "$20 – $30 / hr",
    employment_types: options.employment_types ?? ["Full-Time"],
    description:
      options.description ??
      "<p>Automated test job description for Red Deer Jobs QA.</p>",
    apply_method: options.apply_method ?? "url",
    apply_value: options.apply_value ?? "https://example.com/apply",
    employer_email: options.employer_email ?? "playwright-test@example.com",
    status: options.status ?? "live",
  }

  const { data, error } = await getAdminSupabase()
    .from("jobs")
    .insert(row)
    .select("id, edit_token, title, status, apply_method, apply_value")
    .single()

  if (error) throw new Error(`insertTestJob failed: ${error.message}`)
  return data
}

export async function deleteAllTestJobs() {
  const supabase = getAdminSupabase()
  const { data, error } = await supabase
    .from("jobs")
    .select("id")
    .ilike("title", `${TEST_PREFIX}%`)

  if (error) {
    console.warn("deleteAllTestJobs select failed:", error.message)
    return
  }

  if (!data?.length) return

  const { error: deleteError } = await supabase
    .from("jobs")
    .delete()
    .in(
      "id",
      data.map((row) => row.id)
    )

  if (deleteError) {
    console.warn("deleteAllTestJobs delete failed:", deleteError.message)
  }
}

export async function findTestJobByTitle(title: string) {
  const { data, error } = await getAdminSupabase()
    .from("jobs")
    .select("id, edit_token, title, status")
    .eq("title", title)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}
