import { createHash, randomUUID } from "crypto"

import { Resend } from "resend"

import { createAdminClient } from "@/lib/supabase/admin"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESEND_FROM_DEFAULT = "onboarding@resend.dev" as const
const CONFIRM_TTL_MS = 24 * 60 * 60 * 1000
const IP_LIMIT = 5
const IP_WINDOW_MS = 60 * 60 * 1000
const EMAIL_LIMIT_WINDOW_MS = 15 * 60 * 1000
const ATTEMPT_RETENTION_MS = 48 * 60 * 60 * 1000

export type JobAlertSignupResult =
  | { ok: true; status: "confirmation_sent" }
  | { ok: false; status: "invalid_email" }
  | { ok: false; status: "error" }

export type JobAlertConfirmResult =
  | { ok: true; searchQuery: string | null }
  | { ok: false; reason: "invalid" }

type SubscriberRow = {
  id: string
  email: string
  search_query: string | null
  confirmed_at: string | null
}

export function isValidAlertEmail(email: string): boolean {
  const trimmed = email.trim()
  if (trimmed.length > 320) return false
  return EMAIL_PATTERN.test(trimmed)
}

export function normalizeAlertEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeAlertSearchQuery(
  query: string | null | undefined
): string | null {
  if (query == null) return null
  const trimmed = query.trim()
  if (!trimmed || trimmed.length > 200) return null
  return trimmed.toLowerCase()
}

export function hashClientIp(ip: string): string {
  const secret =
    process.env.SUPABASE_SECRET_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    "dev-alert-rate-limit"
  return createHash("sha256").update(`${secret}:${ip}`).digest("hex")
}

async function cleanupStaleRows(supabase: ReturnType<typeof createAdminClient>) {
  const attemptCutoff = new Date(Date.now() - ATTEMPT_RETENTION_MS).toISOString()
  const now = new Date().toISOString()

  await supabase
    .from("job_alert_attempts")
    .delete()
    .lt("created_at", attemptCutoff)

  await supabase
    .from("job_alert_subscribers")
    .delete()
    .is("confirmed_at", null)
    .not("confirm_expires_at", "is", null)
    .lt("confirm_expires_at", now)
}

async function findSubscriber(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  searchQuery: string | null
): Promise<SubscriberRow | null> {
  let query = supabase
    .from("job_alert_subscribers")
    .select("id, email, search_query, confirmed_at")
    .eq("email", email)

  query =
    searchQuery === null
      ? query.is("search_query", null)
      : query.eq("search_query", searchQuery)

  const { data, error } = await query.maybeSingle()
  if (error) {
    throw new Error(error.message)
  }
  return data as SubscriberRow | null
}

async function isRateLimited(
  supabase: ReturnType<typeof createAdminClient>,
  ipHash: string,
  email: string
): Promise<boolean> {
  if (process.env.PLAYWRIGHT_MOCK_RESEND === "1") {
    return false
  }

  const ipSince = new Date(Date.now() - IP_WINDOW_MS).toISOString()
  const emailSince = new Date(Date.now() - EMAIL_LIMIT_WINDOW_MS).toISOString()

  const { count: ipCount, error: ipError } = await supabase
    .from("job_alert_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", ipSince)

  if (ipError) throw new Error(ipError.message)
  if ((ipCount ?? 0) >= IP_LIMIT) return true

  const { count: emailCount, error: emailError } = await supabase
    .from("job_alert_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", emailSince)

  if (emailError) throw new Error(emailError.message)
  return (emailCount ?? 0) >= 1
}

async function sendConfirmEmail(
  to: string,
  confirmToken: string,
  searchQuery: string | null
): Promise<void> {
  if (process.env.PLAYWRIGHT_MOCK_RESEND === "1") {
    return
  }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "")
  if (!apiKey || !siteUrl) {
    throw new Error("Missing RESEND_API_KEY or NEXT_PUBLIC_SITE_URL.")
  }

  const from = process.env.RESEND_FROM?.trim() || RESEND_FROM_DEFAULT
  const confirmUrl = `${siteUrl}/alerts/confirm/${confirmToken}`
  const resend = new Resend(apiKey)

  const subject =
    searchQuery === null
      ? "Confirm your Red Deer Jobs daily alerts"
      : `Confirm alerts for “${searchQuery}” jobs in Red Deer`

  const intro =
    searchQuery === null
      ? "Confirm your email to get a short morning note when new Red Deer roles are posted."
      : `Confirm your email and we will notify you when a new “${searchQuery}” job is posted in Red Deer.`

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html: `<p>${intro}</p><p><a href="${confirmUrl}">Confirm email alerts</a></p><p>If you did not request this, you can ignore this message.</p>`,
    text: `${intro}\n\nConfirm:\n${confirmUrl}\n\nIf you did not request this, ignore this message.`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function requestJobAlertSignup(input: {
  email: string
  searchQuery: string | null | undefined
  clientIp: string
}): Promise<JobAlertSignupResult> {
  if (!isValidAlertEmail(input.email)) {
    return { ok: false, status: "invalid_email" }
  }

  const normalizedEmail = normalizeAlertEmail(input.email)
  const normalizedQuery = normalizeAlertSearchQuery(input.searchQuery)
  const ipHash = hashClientIp(input.clientIp || "unknown")

  try {
    const supabase = createAdminClient()
    await cleanupStaleRows(supabase)

    const existing = await findSubscriber(
      supabase,
      normalizedEmail,
      normalizedQuery
    )
    if (existing?.confirmed_at) {
      return { ok: true, status: "confirmation_sent" }
    }

    if (await isRateLimited(supabase, ipHash, normalizedEmail)) {
      return { ok: true, status: "confirmation_sent" }
    }

    const { error: attemptError } = await supabase
      .from("job_alert_attempts")
      .insert({ ip_hash: ipHash, email: normalizedEmail })

    if (attemptError) {
      console.error("job alert attempt insert:", attemptError.message)
      return { ok: false, status: "error" }
    }

    const confirmToken = randomUUID()
    const confirmExpiresAt = new Date(Date.now() + CONFIRM_TTL_MS).toISOString()

    if (existing) {
      const { error: updateError } = await supabase
        .from("job_alert_subscribers")
        .update({
          confirm_token: confirmToken,
          confirm_expires_at: confirmExpiresAt,
        })
        .eq("id", existing.id)

      if (updateError) {
        console.error("job alert subscriber update:", updateError.message)
        return { ok: false, status: "error" }
      }
    } else {
      const { error: insertError } = await supabase
        .from("job_alert_subscribers")
        .insert({
          email: normalizedEmail,
          search_query: normalizedQuery,
          confirm_token: confirmToken,
          confirm_expires_at: confirmExpiresAt,
        })

      if (insertError) {
        console.error("job alert subscriber insert:", insertError.message)
        return { ok: false, status: "error" }
      }
    }

    await sendConfirmEmail(normalizedEmail, confirmToken, normalizedQuery)
    return { ok: true, status: "confirmation_sent" }
  } catch (error) {
    console.error("job alert signup:", error)
    return { ok: false, status: "error" }
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function confirmJobAlertToken(
  token: string
): Promise<JobAlertConfirmResult> {
  if (!UUID_PATTERN.test(token.trim())) {
    return { ok: false, reason: "invalid" }
  }

  try {
    const supabase = createAdminClient()
    await cleanupStaleRows(supabase)

    const { data, error } = await supabase
      .from("job_alert_subscribers")
      .select("id, search_query, confirm_expires_at, confirmed_at")
      .eq("confirm_token", token)
      .maybeSingle()

    if (error) {
      console.error("job alert confirm fetch:", error.message)
      return { ok: false, reason: "invalid" }
    }

    if (!data?.confirm_expires_at) {
      return { ok: false, reason: "invalid" }
    }

    if (data.confirmed_at) {
      return { ok: true, searchQuery: data.search_query }
    }

    const expiresAt = new Date(data.confirm_expires_at).getTime()
    if (Number.isNaN(expiresAt) || expiresAt < Date.now()) {
      return { ok: false, reason: "invalid" }
    }

    const { error: updateError } = await supabase
      .from("job_alert_subscribers")
      .update({
        confirmed_at: new Date().toISOString(),
        confirm_token: null,
        confirm_expires_at: null,
      })
      .eq("id", data.id)

    if (updateError) {
      console.error("job alert confirm update:", updateError.message)
      return { ok: false, reason: "invalid" }
    }

    return { ok: true, searchQuery: data.search_query }
  } catch (error) {
    console.error("job alert confirm:", error)
    return { ok: false, reason: "invalid" }
  }
}
